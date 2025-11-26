import conf from "../conf/config";
import { Client, ID, Databases, Storage, Query } from "appwrite";

export class Service {
  client = new Client();
  databases;
  bucket;
  constructor() {
    this.client
      .setEndpoint(conf.appwriteurl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  async createPost({ title, slug, content, featuredImage, status, userId }) {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          featuredImage,
          status,
          userId,
        }
      );
    } catch (error) {
      console.log("Apwrite service createPost::error", error);
    }
  }

  async updatePost(slug, { title, content, featuredImage, status }) {
    try {
      await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          featuredImage,
          status,
        }
      );
    } catch (error) {
      console.log("Apwrite service updatePost::error", error);
    }
  }

  async deletePost(slug) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
      return ture;
    } catch (error) {
      console.log("Apwrite service deletePost::error", error);
      return false;
    }
  }

  async getPost(slug) {
    try {
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
    } catch (error) {
      console.log("Apwrite service getPost::error", error);
    }
  }

  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        queries
      );
    } catch (error) {
      console.log("Apwrite service getPosts::error", error);
      return false;
    }
  }

  async uploadFile(file) {
    try {
      return await this.bucket.createFile(
        conf.appwriteBucketId,
        ID.unique(),
        file
      );
    } catch (error) {
      console.log("Apwrite service uploadFile::error", error);
      return false;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
      return true;
    } catch (error) {
      console.log("Apwrite service deleteFile::error", error);
    }
  }
  // getFilePreview(fileId) {
  //   return this.bucket.getFilePreview(conf.appwriteBucketId, fileId);
  // }
  // inside your Service class in src/appwrite/config.js
  // inside your Service class in src/appwrite/config.js
  // Replace any existing getFilePreview definition with this async version.

  // src/appwrite/config.js  (inside Service class)
  async getFilePreview(fileId) {
    if (!fileId) return "/petsblog.png";

    try {
      // Ask Appwrite for a resized preview (returns an object with .href)
      const preview = await this.bucket.getFilePreview(
        conf.appwriteBucketId,
        fileId,
        600, // width
        400, // height
        "center", // gravity/fit
        80 // quality
      );

      // If SDK returns object with href -> return the string
      if (preview && typeof preview.href === "string") {
        return preview.href;
      }

      // Fallback: construct the public view URL (works if file is public)
      const endpoint = (conf.appwriteurl || "").replace(/\/$/, "");
      return `${endpoint}/storage/buckets/${conf.appwriteBucketId}/files/${fileId}/view?project=${conf.appwriteProjectId}`;
    } catch (err) {
      console.error("getFilePreview error:", err);
      try {
        const endpoint = (conf.appwriteurl || "").replace(/\/$/, "");
        return `${endpoint}/storage/buckets/${conf.appwriteBucketId}/files/${fileId}/view?project=${conf.appwriteProjectId}`;
      } catch (e) {
        return "/petsblog.png";
      }
    }
  }
}

const service = new Service();

export default service;
