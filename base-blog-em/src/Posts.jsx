import { useEffect, useState } from "react";

import { useQuery, useQueryClient } from "react-query";

import { PostDetail } from "./PostDetail";

import { ReactQueryDevtools } from "react-query/devtools";
const maxPostPage = 10;

async function fetchPosts(currentPage) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${currentPage}`
  );
  return response.json();
}

export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  const queryClient = useQueryClient();

  // replace with useQuery
  const { data, isError, isLoading, error } = useQuery(
    ["posts", currentPage],
    () => fetchPosts(currentPage),
    {
      staleTime: 2000,
    }
  );

  useEffect(() => {
    if (currentPage < maxPostPage) {
      queryClient.prefetchQuery(
        ["posts", currentPage + 1],
        () => fetchPosts(currentPage + 1),
        {
          staleTime: 2000,
          keepPreviousData: true,
        }
      );
    }
  }, [currentPage, queryClient]);
  if (isLoading) return <h3>Loading...</h3>;
  if (isError)
    return (
      <>
        <h3>Oops! Something went wrong...</h3>
        <p>{error.toString()}</p>
      </>
    );

  const changeCurrentPage = (amountToChange) => {
    setCurrentPage((prevPage) => prevPage + amountToChange);
    setSelectedPost(null);
  };

  return (
    <>
      <ul>
        {data.map((post) => (
          <li
            key={post.id}
            className="post-title"
            onClick={() => setSelectedPost(post)}
          >
            {post.title}
          </li>
        ))}
      </ul>
      <div className="pages">
        <button
          disabled={currentPage <= 1}
          onClick={() => changeCurrentPage(-1)}
        >
          Previous page
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage === maxPostPage}
          onClick={() => {
            changeCurrentPage(1);
          }}
        >
          Next page
        </button>
      </div>
      <hr />
      <ReactQueryDevtools />
      {selectedPost && (
        <PostDetail post={selectedPost} currentPage={currentPage} />
      )}
    </>
  );
}
