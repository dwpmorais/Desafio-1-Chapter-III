import { GetStaticProps } from 'next'
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import Link from 'next/link'
import Header from '../components/Header'

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home( { postsPagination }: HomeProps  ) {

  const { results, next_page } = postsPagination;
  const [posts, setPosts] = useState(results);
  const [nextPage, setPageNext] = useState<string | null>(next_page);

  console.log('nextPage', nextPage)

  const handlerLoadMorePosts = async (): Promise<void> => {
    try {
      const response = await (await fetch(nextPage + '&access_token=MC5ZVHo1ZlJBQUFDSUEyS1Q0.NH5w77-977-9fe-_vQjvv70677-977-9Re-_vVZrcVLvv71lTmIC77-977-9Yu-_ve-_ve-_ve-_vTIU')).json();
      const newPosts = response.results as Post[];
      setPageNext(response.next_page);
      setPosts([...posts, ...newPosts]);
    } catch (error) {
      setPageNext(null);
    }
  };

  return(
    <div>
      <Header/>
      <main className={commonStyles.container}>
        { posts.map(post => (
          <div key={post.uid} className={styles.post}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <h2>{post.data.title}</h2>
                <h5>{post.data.subtitle}</h5>
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
              </a>
            </Link>
          </div>
          ))
        }

        { nextPage &&
          <button className={styles.btnMorePost} onClick={handlerLoadMorePosts}>
            Carregar mais posts
          </button>
        }
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.content', 'posts.author'],
    pageSize: 2,
  })

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }
  })

  console.log('posts formatados', JSON.stringify(posts, null, 2 ))

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    }
  }

};
