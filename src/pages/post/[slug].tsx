import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'

import { getPrismicClient } from '../../services/prismic';
import Head from "next/head";
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import Header from '../../components/Header'
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'
import { RichText } from 'prismic-dom'
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}><p>Carregando...</p></div>
      </div>
    )
  } else {
    return (
      <>
        <Head>
          <title> Ignews | {post.data.title} </title>
        </Head>
        <Header/>

        <div className={styles.bgImage} style={{ backgroundImage: `url(${post.data.banner.url})` }}/>

        <section className={commonStyles.container}>
          <div className={styles.post}>
            <h1> {post.data.title} </h1>

            <span>
            <FiCalendar className={styles.icons}/>
              {
                format(
                  new Date(post.first_publication_date),
                  'dd MMM yyyy',
                  {
                    locale: ptBR,
                  },
                )
              }
          </span>

            <span> <FiUser className={styles.icons}/> {post.data.author} </span>

            <span> <FiClock className={styles.icons}/> 4 min </span>

            <div className={styles.bodyPost}>
              {post.data.content.map((content, index) => (
                <div key={index}>
                  <h3> {content.heading} </h3>
                  <div className={styles.text} dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}/>
                </div>
              ))
              }
            </div>
          </div>
        </section>
      </>
    )
  }
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ]);
  const paths = posts.results.map(post => ({
    params: { slug: post.uid }
  }))
  return {
    fallback: true,
    paths
  }
};


export const getStaticProps:GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const uid  = params.slug;
  const response = await prismic.getByUID('posts', String(uid), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url : response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post
    },
    revalidate: 60 * 30, // 30 minutes
  }

};
