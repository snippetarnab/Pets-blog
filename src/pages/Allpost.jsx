// import React, { useState, useEffect } from "react";
// import appwriteService from "../appwrite/config";
// import { Container, PostCard } from "../components";

// function Allpost() {
//   const [posts, setPosts] = useState([]);
//   useEffect(() => {}, []);
//   appwriteService.getPosts([]).then((posts) => {
//     if (posts) {
//       setPosts(posts.documents);
//     }
//   });
//   return (
//     <div className="w-full py-8">
//       <Container>
//         <div className="flex flex-wrap">
//           {posts.map((post) => (
//             <div key={post.$id} className="p-2 w-1/4">
//               <PostCard {...post} />
//             </div>
//           ))}
//         </div>
//       </Container>
//     </div>
//   );
// }

// export default Allpost;



//After the Update

// src/pages/Allpost.jsx
import React, { useState, useEffect } from "react";
import appwriteService from "../appwrite/config";
import { Container, PostCard } from "../components";

function Allpost() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    //console.log("[ALLPOST] mounted"); // <- immediate mount log

    // expose service so you can run tests from browser console if needed
    try {
      // eslint-disable-next-line no-undef
      window.appwriteService = appwriteService;
    } catch (e) {}

    async function load() {
      setStatus("loading");
      //console.log("[ALLPOST] calling getPosts()...");
      try {
        const res = await appwriteService.getPosts([]); // keep [] if your service expects queries
        //console.log("[ALLPOST] getPosts() resolved:", res);
        if (!res) {
          //console.warn("[ALLPOST] getPosts returned falsy:", res);
          setPosts([]);
          setStatus("no-data");
          return;
        }
        const docs = res.documents || [];
        //console.log(`[ALLPOST] documents count: ${docs.length}`);
        docs.forEach((d, i) => {
          //console.log(`[ALLPOST] doc[${i}] id: ${d.$id}`, d);
          // try to get preview URL for each document and log result
          try {
            const maybe = appwriteService.getFilePreview(d.featuredImage);
            // if it's a promise:
            if (maybe && typeof maybe.then === "function") {
              maybe
                .then((val) => console.log(`[ALLPOST] preview for ${d.$id}:`, val))
                .catch((err) =>
                  console.error(`[ALLPOST] preview error for ${d.$id}:`, err)
                );
            } else {
              console.log(`[ALLPOST] preview for ${d.$id}:`, maybe);
            }
          } catch (e) {
            console.error(`[ALLPOST] preview sync error for ${d.$id}:`, e);
          }
        });

        setPosts(docs);
        setStatus("loaded");
      } catch (err) {
        console.error("[ALLPOST] getPosts() threw:", err);
        setPosts([]);
        setStatus("error");
      }
    }

    load();
  }, []);

  return (
    <div className="w-full py-8">
      <Container>
        <div className="mb-4 text-sm text-gray-500">Status: {status}</div>
        <div className="flex flex-wrap -mx-2">
          {posts.length === 0 && status === "loaded" && (
            <div className="w-full text-center py-8 text-gray-500">
              No posts found.
            </div>
          )}

          {posts.map((post) => (
            <div key={post.$id} className="px-2 mb-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
              <PostCard {...post} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export default Allpost;
