// import React, { useCallback } from "react";
// import { useForm } from "react-hook-form";
// import { Button, Input, Select, RTE } from "../index.js";
// import appwriteService from "../../appwrite/config.js";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// function PostForm({ post }) {
//   const { register, handleSubmit, watch, setValue, control, getValues } =
//     useForm({
//       defaultValues: {
//         title: post?.title || "",
//         slug: post?.$id || "",
//         content: post?.content || "",
//         status: post?.status || "active",
//       },
//     });

//   const navigate = useNavigate();
//   const userData = useSelector((state) => state.auth?.userData);

//   const submit = async (data) => {
//     if (post) {
//       const file = data.image[0]
//         ? appwriteService.uploadFile(data.image[0])
//         : null;

//       if (file) {
//         appwriteService.deleteFile(post.featuredImage);
//       }
//       const dbPost = await appwriteService.updatePost(post.$id, {
//         ...data,
//         featuredImage: file ? file.$id : undefined,
//       });
//       if (dbPost) {
//         navigate(`/post/${dbPost.$id}`);
//       }
//     } else {
//       const file = await appwriteService.uploadFile(data.image[0]);
//       if (file) {
//         console.log(data.image);
//         console.log(file);

//         const fileId = file.$id;
//         data.featuredImage = fileId;
//         const dbPost = await appwriteService.createPost({
//           ...data,
//           userId: userData.$id,
//         });
//         if (dbPost) {
//           navigate(`/post/${dbPost.$id}`);
//         }
//       }
//     }
//   };

//   const slugTransform = useCallback((value) => {
//     if (value && typeof value === "string")
//       return value
//         .trim()
//         .toLocaleLowerCase()
//         .replace(/[^a-zA-Z\d\s]+/g, "-")
//         .replace(/\s+/g, "-");
//     return "";
//   }, []);

//   React.useEffect(() => {
//     const subscription = watch((value, { name }) => {
//       if (name === "title") {
//         setValue("slug", slugTransform(value.title), { shouldValidate: true });
//       }
//     });

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [watch, setValue, slugTransform]);

//   return (
//     <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
//       <div className="w-2/3 px-2">
//         <Input
//           label="Title :"
//           placeholder="Title"
//           className="mb-4"
//           {...register("title", { required: true })}
//         />
//         <Input
//           label="Slug :"
//           placeholder="Slug"
//           className="mb-4"
//           {...register("slug", { required: true })}
//           onInput={(e) => {
//             setValue("slug", slugTransform(e.currentTarget.value), {
//               shouldValidate: true,
//             });
//           }}
//         />
//         <RTE
//           label="Content :"
//           name="content"
//           control={control}
//           defaultValue={getValues("content")}
//         />
//       </div>
//       <div className="w-1/3 px-2">
//         <Input
//           label="Featured Image :"
//           type="file"
//           className="mb-4"
//           accept="image/png, image/jpg, image/jpeg, image/gif"
//           {...register("image", { required: !post })}
//         />
//         {post && (
//           <div className="w-full mb-4">
//             <img
//               src={appwriteService.getFilePreview(post.featuredImage)}
//               alt={post.title}
//               className="rounded-lg"
//             />
//           </div>
//         )}
//         <Select
//           options={["active", "inactive"]}
//           label="Status"
//           className="mb-4"
//           {...register("status", { required: true })}
//         />
//         <Button
//           type="submit"
//           bgColor={post ? "bg-green-500" : undefined}
//           className="w-full"
//         >
//           {post ? "Update" : "Submit"}
//         </Button>
//       </div>
//     </form>
//   );
// }

// export default PostForm;

// After the Update

// src/components/PostForm.jsx  (replace your existing file with this)

// src/components/PostForm.jsx


// src/components/post-form/PostForm.jsx


// src/components/post-form/PostForm.jsx




// src/components/post-form/PostForm.jsx  (diagnostic version)
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select, RTE } from "../index";
import appwriteService from "../../appwrite/config.js";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const FALLBACK = "/petsblog.png";
const THUMB_W = 216;
const THUMB_H = 193;
const LARGE_W = 1200;
const LARGE_H = 800;

export default function PostForm({ post }) {
  const { register, handleSubmit, watch, setValue, control, getValues } =
    useForm({
      defaultValues: {
        title: post?.title || "",
        slug: post?.$id || "",
        content: post?.content || "",
        status: post?.status || "active",
      },
    });

  // expose service to window for manual tests
  try { window.appwriteService = appwriteService; } catch (e) {}

  const navigate = useNavigate();
  const userData = useSelector((s) => s.auth?.userData);

  const [thumbSrc, setThumbSrc] = useState(FALLBACK);
  const [largeSrc, setLargeSrc] = useState(null);
  const [loadingThumb, setLoadingThumb] = useState(true);
  const [loadingLarge, setLoadingLarge] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const thumbObjRef = useRef(null);
  const largeObjRef = useRef(null);
  const abortThumbRef = useRef(null);
  const abortLargeRef = useRef(null);

  // helper to resolve preview URL
  async function resolvePreviewUrl(fileId, width, height, quality = 80) {
    if (!fileId) return "";
    try {
      const maybe = appwriteService.getFilePreview(fileId, width, height, quality);
      const resolved = typeof maybe === "string" ? maybe : await maybe;
      if (resolved && typeof resolved === "object" && typeof resolved.href === "string") return resolved.href;
      if (typeof resolved === "string") return resolved;
      return "";
    } catch (err) {
      console.error("resolvePreviewUrl error:", err);
      return "";
    }
  }

  // diagnostic logs helper
  const diag = (...args) => {
    try { console.log("DIAG:", ...args); } catch (e) {}
  };

  // load thumbnail with diagnostics
  useEffect(() => {
    let mounted = true;

    async function loadThumb() {
      diag("mount - loadThumb start", { post });

      setLoadingThumb(true);
      // cleanup previous
      try { if (abortThumbRef.current) abortThumbRef.current.abort(); } catch (e) {}
      try { if (thumbObjRef.current) { URL.revokeObjectURL(thumbObjRef.current); thumbObjRef.current = null; } } catch (e) {}

      if (!post) {
        diag("no post prop passed to PostForm");
        setThumbSrc(FALLBACK);
        setLoadingThumb(false);
        return;
      }

      const fileId = post.featuredImage;
      diag("post.$id:", post.$id, "featuredImage:", fileId);

      if (!fileId) {
        diag("no featuredImage for this post");
        setThumbSrc(FALLBACK);
        setLoadingThumb(false);
        return;
      }

      try {
        const url = await resolvePreviewUrl(fileId, THUMB_W, THUMB_H, 75);
        diag("resolved thumb url:", url);

        if (!url) {
          diag("resolvePreviewUrl returned empty for fileId:", fileId);
          setThumbSrc(FALLBACK);
          setLoadingThumb(false);
          return;
        }

        // set direct url immediately for quick render
        if (mounted) {
          diag("setting thumbSrc (direct url) to:", url);
          setThumbSrc(url);
        }

        // fetch bytes to validate and create objectURL
        abortThumbRef.current = new AbortController();
        const res = await fetch(url, { signal: abortThumbRef.current.signal, cache: "no-store" });

        diag("thumb fetch result:", res.status, res.headers.get("Content-Type"));

        if (!res.ok) {
          diag("thumb fetch not ok:", res.status);
          setLoadingThumb(false);
          return;
        }

        const ct = res.headers.get("Content-Type") || "";
        if (!ct.startsWith("image/")) {
          diag("thumb returned non-image content-type:", ct);
          if (mounted) setThumbSrc(FALLBACK);
          setLoadingThumb(false);
          return;
        }

        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        thumbObjRef.current = objUrl;
        diag("created thumb objectURL");
        if (mounted) setThumbSrc(objUrl);
      } catch (err) {
        diag("loadThumb error:", err);
        if (mounted) setThumbSrc(FALLBACK);
      } finally {
        if (mounted) setLoadingThumb(false);
        diag("loadThumb finished", { thumbSrc });
      }
    }

    loadThumb();

    return () => {
      mounted = false;
      try { if (abortThumbRef.current) abortThumbRef.current.abort(); } catch (e) {}
      try { if (thumbObjRef.current) { URL.revokeObjectURL(thumbObjRef.current); thumbObjRef.current = null; } } catch (e) {}
      diag("cleanup loadThumb");
    };
  }, [post?.featuredImage, post]);

  // open large preview with diagnostics
  const openLargePreview = useCallback(async () => {
    diag("openLargePreview start", { post });
    if (!post?.featuredImage) {
      diag("no featuredImage to open");
      setLargeSrc(FALLBACK);
      setModalOpen(true);
      return;
    }

    if (largeSrc) {
      diag("largeSrc already available, opening modal");
      setModalOpen(true);
      return;
    }

    setLoadingLarge(true);
    const fileId = post.featuredImage;
    diag("requesting large preview for fileId:", fileId);

    try {
      const url = await resolvePreviewUrl(fileId, LARGE_W, LARGE_H, 80);
      diag("resolved large url:", url);

      if (!url) {
        setLargeSrc(FALLBACK);
        setModalOpen(true);
        setLoadingLarge(false);
        return;
      }

      // set direct url for quick display
      setLargeSrc(url);
      try { if (abortLargeRef.current) abortLargeRef.current.abort(); } catch (e) {}
      abortLargeRef.current = new AbortController();

      const res = await fetch(url, { signal: abortLargeRef.current.signal, cache: "no-store" });
      diag("large fetch result:", res.status, res.headers.get("Content-Type"));

      if (!res.ok) {
        diag("large fetch not ok:", res.status);
        setModalOpen(true);
        setLoadingLarge(false);
        return;
      }

      const ct = res.headers.get("Content-Type") || "";
      if (!ct.startsWith("image/")) {
        diag("large content-type not image:", ct);
        setLargeSrc(FALLBACK);
        setModalOpen(true);
        setLoadingLarge(false);
        return;
      }

      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      largeObjRef.current = objUrl;
      setLargeSrc(objUrl);
      setModalOpen(true);
    } catch (err) {
      diag("openLargePreview error:", err);
      setLargeSrc(FALLBACK);
      setModalOpen(true);
    } finally {
      setLoadingLarge(false);
      diag("openLargePreview finished", { largeSrc });
    }
  }, [post, largeSrc]);

  useEffect(() => {
    return () => {
      try { if (abortLargeRef.current) abortLargeRef.current.abort(); } catch (e) {}
      try { if (largeObjRef.current) { URL.revokeObjectURL(largeObjRef.current); largeObjRef.current = null; } } catch (e) {}
      diag("cleanup large preview on unmount");
    };
  }, []);

  // submit handler (unchanged)
  const submit = async (data) => {
    try {
      if (post) {
        let fileObj = null;
        if (data.image && data.image.length > 0) {
          fileObj = await appwriteService.uploadFile(data.image[0]);
        }

        if (fileObj && post.featuredImage) {
          try { await appwriteService.deleteFile(post.featuredImage); } catch (e) { diag("deleteFile error", e); }
        }

        const dbPost = await appwriteService.updatePost(post.$id, {
          ...data,
          featuredImage: fileObj ? fileObj.$id : undefined,
        });

        if (dbPost) navigate(`/post/${dbPost.$id}`);
      } else {
        const file = data.image && data.image.length > 0 ? await appwriteService.uploadFile(data.image[0]) : null;
        if (!file) {
          diag("No file uploaded on create");
          return;
        }
        data.featuredImage = file.$id;
        const dbPost = await appwriteService.createPost({
          ...data,
          userId: userData?.$id,
        });
        if (dbPost) navigate(`/post/${dbPost.$id}`);
      }
    } catch (err) {
      diag("submit error:", err);
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string") return value.trim().toLowerCase().replace(/[^a-zA-Z\d\s]+/g, "-").replace(/\s+/g, "-");
    return "";
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, slugTransform]);

  // final JSX
  return (
    <>
      <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
        <div className="w-2/3 px-2">
          <Input label="Title :" placeholder="Title" className="mb-4" {...register("title", { required: true })} />
          <Input label="Slug :" placeholder="Slug" className="mb-4" {...register("slug", { required: true })} onInput={(e) => setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true })} />
          <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
        </div>

        <div className="w-1/3 px-2">
          <Input label="Featured Image :" type="file" className="mb-4" accept="image/png, image/jpg, image/jpeg, image/gif" {...register("image", { required: !post })} />

          {post && (
            <div className="w-full mb-4">
              <div className="w-full h-[193px] overflow-hidden rounded-lg bg-gray-50 flex items-center">
                <button type="button" onClick={openLargePreview} className="w-full h-full p-0 border-0 bg-transparent" title="Click to view large image">
                  <img id="diagnostic-thumb-img" src={thumbSrc} alt={post.title || "featured"} className="w-full h-full object-cover" loading="lazy" onError={(e) => { diag("img element onError. src:", e.currentTarget.src); e.currentTarget.src = FALLBACK; }} />
                </button>
              </div>

              <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                <span>{loadingThumb ? "Loading preview..." : "Thumbnail"}</span>
                <button type="button" onClick={openLargePreview} className="text-sm text-blue-600 underline">{loadingLarge ? "Loading large..." : "View large"}</button>
              </div>
            </div>
          )}

          <Select options={["active", "inactive"]} label="Status" className="mb-4" {...register("status", { required: true })} />
          <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">{post ? "Update" : "Submit"}</Button>
        </div>
      </form>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModalOpen(false)}>
          <div className="max-w-5xl w-full max-h-[90vh] overflow-hidden rounded-lg bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="w-full h-[70vh] bg-gray-100">
              <img src={largeSrc || FALLBACK} alt={post?.title || "large preview"} className="w-full h-full object-contain" loading="lazy" onError={(e) => { diag("large img onError src:", e.currentTarget.src); e.currentTarget.src = FALLBACK; }} />
            </div>
            <div className="p-3 text-right"><button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setModalOpen(false)}>Close</button></div>
          </div>
        </div>
      )}
    </>
  );
}
