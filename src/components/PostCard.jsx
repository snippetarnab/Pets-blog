// import React from "react";
// import { Link } from "react-router-dom";
// import appwriteService from "../appwrite/config.js";

// function PostCard({ $id, title, featuredImage }) {
//   return (
//     <Link to={`/post/${$id}`}>
//       <div className="w-full bg-gray-100 p-4 rounded-xl">
//         <div className="w-full mb-4 justify-center">
//           {/* <img
//             src={appwriteService.getFilePreview(featuredImage)}
//             alt={title}
//             className="rounded-xl"
//           /> */}
//           <img
//             src={appwriteService.getFilePreview(featuredImage)}
//             alt={title}
//             loading="lazy"
//             className="w-full h-48 object-cover rounded-xl"
//           />
//         </div>
//         <h2 className="text-xl font-bold">{title}</h2>
//       </div>
//     </Link>
//   );
// }

// export default PostCard;

//After the Update

// src/components/PostCard.jsx

// src/components/PostCard.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/config";

// fallback image in public/petsblog.png
const FALLBACK = "/petsblog.png";

/**
 * PostCard - thumbnail card used in lists/grids
 * Props:
 *  - $id (string)       : post id used in link
 *  - title (string)     : post title
 *  - featuredImage (id) : Appwrite file id (or a Cloudinary/url)
 */
function PostCard({ $id, title, featuredImage }) {
  const [src, setSrc] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const objectUrlRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const revokeObjectUrl = () => {
      try {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      } catch (e) {
        /* ignore */
      }
    };

    const abortPrevious = () => {
      try {
        if (abortRef.current) abortRef.current.abort();
      } catch (e) {}
      abortRef.current = null;
    };

    async function loadPreview() {
      setLoading(true);
      revokeObjectUrl();
      abortPrevious();
      if (!featuredImage) {
        setSrc(FALLBACK);
        setLoading(false);
        return;
      }

      try {
        // Request a small thumbnail for cards (change size if you like)
        const maybe = appwriteService.getFilePreview(
          featuredImage,
          600,
          400,
          75
        );
        const resolved = typeof maybe === "string" ? maybe : await maybe;

        // support SDK object with .href or plain string URL
        const url =
          resolved &&
          typeof resolved === "object" &&
          typeof resolved.href === "string"
            ? resolved.href
            : typeof resolved === "string"
            ? resolved
            : "";

        if (!url) throw new Error("no preview url returned");

        // fetch bytes and create object URL (keeps behavior consistent across environments)
        abortRef.current = new AbortController();
        const freshUrl =
          url + (url.includes("?") ? "&" : "?") + `_cache=${Date.now()}`;
        const res = await fetch(freshUrl, {
          method: "GET",
          cache: "no-store",
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error("fetch failed " + res.status);

        const contentType = res.headers.get("Content-Type") || "";
        if (!contentType.startsWith("image/"))
          throw new Error("not an image: " + contentType);

        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;

        if (mounted) setSrc(objectUrl);
      } catch (err) {
        console.error("[PostCard] image load error:", err);
        if (mounted) setSrc(FALLBACK);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPreview();

    return () => {
      mounted = false;
      abortPrevious();
      revokeObjectUrl();
    };
  }, [featuredImage]);

  return (
    <Link to={`/post/${$id}`}>
      <article className="w-full bg-gray-100 p-4 rounded-xl hover:shadow-md transition">
        <div className="w-full mb-4">
          <div className="w-full h-48 overflow-hidden rounded-lg bg-gray-50">
            <img
              src={src}
              alt={title || "post image"}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                console.error("[PostCard] img error src:", e.currentTarget.src);
                e.currentTarget.src = FALLBACK;
              }}
            />
          </div>
        </div>

        <h2 className="text-xl font-bold line-clamp-2">{title}</h2>
      </article>
    </Link>
  );
}

export default PostCard;
