// 

//After the changes 


// src/pages/Post.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

const FALLBACK = "/petsblog.png";

export default function Post() {
  const [post, setPost] = useState(null);
  const [imgSrc, setImgSrc] = useState(FALLBACK);
  const [loadingImg, setLoadingImg] = useState(true);
  const imgObjectUrlRef = useRef(null);
  const abortRef = useRef(null);

  const { slug } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth?.userData);

  const isAuthor = post && userData ? post.userId === userData.$id : false;

  useEffect(() => {
    if (!slug) {
      navigate("/");
      return;
    }

    let cancelled = false;
    appwriteService.getPost(slug).then((p) => {
      if (cancelled) return;
      if (p) setPost(p);
      else navigate("/");
    });

    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  useEffect(() => {
    // cleanup helper
    const revoke = () => {
      try {
        if (imgObjectUrlRef.current) {
          URL.revokeObjectURL(imgObjectUrlRef.current);
          imgObjectUrlRef.current = null;
        }
      } catch (e) {}
    };

    async function loadImage(fileId) {
      setLoadingImg(true);
      revoke();
      try {
        if (!fileId) {
          setImgSrc(FALLBACK);
          setLoadingImg(false);
          return;
        }

        // compute desired width based on viewport and device pixel ratio (capped)
        const DPR = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const desiredCssWidth = Math.min(1200, Math.max(600, Math.round(window.innerWidth * 0.8))); // use 80% of viewport
        const desiredWidth = Math.min(2000, Math.round(desiredCssWidth * DPR)); // cap to avoid huge downloads
        const desiredHeight = Math.round((desiredWidth * 2) / 3); // 3:2 ratio (adjust if you want)

        // call getFilePreview with explicit size. Your service should accept (fileId, width, height, quality)
        const maybe = appwriteService.getFilePreview(fileId, desiredWidth, desiredHeight, 80);
        const resolved = typeof maybe === "string" ? maybe : await maybe;

        const url =
          resolved && typeof resolved === "object" && typeof resolved.href === "string"
            ? resolved.href
            : typeof resolved === "string"
            ? resolved
            : "";

        if (!url) {
          setImgSrc(FALLBACK);
          setLoadingImg(false);
          return;
        }

        // Set direct url first so browser can render if it's directly usable
        setImgSrc(url);

        // Then fetch bytes to create objectURL (gives consistent behavior and allows checking content-type)
        try {
          if (abortRef.current) abortRef.current.abort();
        } catch (e) {}
        abortRef.current = new AbortController();

        const res = await fetch(url, { method: "GET", cache: "no-store", signal: abortRef.current.signal });
        // If server returns image bytes, use an objectURL for stable rendering
        if (res.ok) {
          const ct = res.headers.get("Content-Type") || "";
          if (ct.startsWith("image/")) {
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            imgObjectUrlRef.current = objectUrl;
            setImgSrc(objectUrl);
            setLoadingImg(false);
            return;
          } else {
            // returned HTML or other content
            console.warn("Post image URL returned non-image content-type:", ct);
            // leave direct url (may be image anyway) or fallback
            setLoadingImg(false);
            return;
          }
        } else {
          console.warn("Post image fetch failed:", res.status);
          setLoadingImg(false);
          return;
        }
      } catch (err) {
        console.error("loadImage error:", err);
        setImgSrc(FALLBACK);
        setLoadingImg(false);
      }
    }

    loadImage(post?.featuredImage);

    return () => {
      try {
        if (abortRef.current) abortRef.current.abort();
      } catch (e) {}
      revoke();
    };
  }, [post]);

  const deletePost = () => {
    if (!post) return;
    appwriteService.deletePost(post.$id).then((status) => {
      if (status) {
        try {
          appwriteService.deleteFile(post.featuredImage);
        } catch (e) {}
        navigate("/");
      }
    });
  };

  if (!post) return null;

  return (
    <div className="py-8">
      <Container>
        <div className="w-full flex justify-center mb-4 relative border rounded-xl p-2">
          <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-gray-50">
            {/* large header image */}
            <div className="w-full h-64 md:h-96 bg-gray-100">
              <img
                src={imgSrc}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // if object URL fails, fall back to fallback image
                  console.error("post <img> onError, src:", e.currentTarget.src);
                  e.currentTarget.src = FALLBACK;
                }}
              />
            </div>
          </div>

          {isAuthor && (
            <div className="absolute right-6 top-6">
              <Link to={`/edit-post/${post.$id}`}>
                <Button bgColor="bg-green-500" className="mr-3">
                  Edit
                </Button>
              </Link>
              <Button bgColor="bg-red-500" onClick={deletePost}>
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="w-full mb-6">
          <h1 className="text-2xl font-bold">{post.title}</h1>
        </div>

        <div className="browser-css">{parse(post.content)}</div>
      </Container>
    </div>
  );
}
