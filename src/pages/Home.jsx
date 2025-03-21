import React, { useEffect, useState } from "react";
import appwriteService from "../appwrite/config";
import { PostCard, Container } from "../components";

function Home() {
  const [posts, setPost] = useState([]);

  useEffect(() => {
    appwriteService.getPosts().then((posts) => {
      if (posts) {
        setPost(posts.documents);
      }
    });
  }, []);

  if (posts.length === 0) {
    return (
      <div className="w-full py-8 mt-4 text-center">
        <Container>
          <div className="flex flex-wrap">
            <div className="p-2 w-full">
              {/* Display a message if there are no posts */}
              {/* <h1 className="text-2xl font-bold hover:text-gray-500">
                Login to read posts
              </h1> */}
              <div class="max-w-sm mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                <img
                  class="w-full h-48 object-cover"
                  src="https://avatars.githubusercontent.com/u/160257879?v=4"
                  alt="Profile picture"
                />
                <div class="p-4">
                  <h2 class="text-lg font-semibold text-gray-800">Arnab</h2>
                  <p class="text-sm text-gray-500">Developer / Designer</p>
                  <div class="flex items-center justify-center space-x-4 mt-4">
                    <a href="#" class="text-blue-500 hover:text-blue-700">
                      <i class="fab fa-facebook"></i>
                    </a>
                    <a
                      href="https://x.com/imArnabParua?t=yAnk60IAsBwevSB9gliCjQ&s=09"
                      class="text-blue-400 hover:text-blue-600"
                    >
                      <i class="fab fa-twitter"></i>
                    </a>
                    <a
                      href="https://www.instagram.com/_i.arnab_?igsh=Nm1kNHcxdnFxOTV2"
                      class="text-pink-500 hover:text-pink-700"
                    >
                      <i class="fab fa-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* Display a message if there are no posts */}
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
