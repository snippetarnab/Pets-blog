import React, { useEffect, useState } from "react";
import appwriteService from "../appwrite/config";
import { PostCard, Container } from "../components";

function Home() {
  const [posts, setPost] = useState([]);

  useEffect(() => {
    appwriteService.getPosts([]).then((posts) => {
      if (posts) {
        setPost(posts.documents);
      }
    });
  }, []);

  if (posts.length === 0) {
    return (
      <div className="w-full py-8 mt-4 text-center">
        <Container>
          <div className="flex flex-wrap justify-center">
            <div className="p-2 w-full flex justify-center">
              <h1 className="text-2xl font-bold hover:text-gray-500">
                Login to read posts
              </h1>
              {/* {mycomponents} */}

              {/* {mycomponents} */}
            </div>
            <div className="mt-5  ">
              <a
                href="#"
                className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <img
                  className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
                  src="/developer.jpg"
                  alt
                />
                <div className="flex flex-col justify-between p-4 ">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    hii guys !! i am Arnab
                  </h5>
                  <p className="mb-3  text-gray-700 dark:text-gray-400 ">
                    Just Sign up and get started don't worry you just put random
                    email like{" "}
                    <a href="#" className=" text-blue-800 px-1 rounded">
                      a@gmail.com
                    </a>{" "}
                    and password.
                  </p>
                </div>
              </a>
            </div>
          </div>
        </Container>
      </div>
    );
  }
  return (
    <div className="w-full py-8">
      <Container>
        <div className="flex flex-wrap">
          {posts.map((post) => (
            <div key={post.$id} className="p-2 w-1/4">
              <PostCard {...post} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export default Home;
