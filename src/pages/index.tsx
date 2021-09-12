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

  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  async function loadNextPage() {
    const response = await fetch(nextPage);
    const data = await response.json();
    const newPosts = data.results.map(post => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      },
    }));
    setPosts([...posts, ...newPosts]);
    setNextPage(data.next_page);
  }

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
          <button type="button" onClick={loadNextPage}>
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
    pageSize: 100,
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
