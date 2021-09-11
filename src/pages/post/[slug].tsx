import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Head from "next/head";

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import Header from '../../components/Header'

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

export default function Post() {
  return (
    <>
      <Header/>
      <h1>Teste</h1>
    </>
  )
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);
//
//   // TODO
// };


// export const getStaticProps = async context => {
//   const prismic = getPrismicClient();
//   const response = await prismic.getByUID('publication', String(slug), {});
//
//   const post = {
//     first_publication_date: format(
//       new Date(response.first_publication_date),
//       "dd MMM yyyy",
//       {
//         locale: ptBR,
//       }
//     ),
//     data: {
//       title: response.data.title,
//       banner: response.data.title,
//       author: response.data.author,
//       content: {
//         heading: response.data.title,
//         body: {
//           text: response.data.title,
//         },
//       },
//     },
//   };
//
//   return {
//     props: {
//       post
//     },
//     revalidate: 60 * 30, // 30 minutes
//   }
//
// };
