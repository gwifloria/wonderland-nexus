// 统一导出所有常量
export * from "./routes";
export * from "./theme";
export * from "./metadata";
export * from "./projectExperience";
export * from "./auth";

// Re-export app-specific constants with namespaces to avoid conflicts
export * as BlogConstants from "../app/blog/constants";
export * as ContactConstants from "../app/contact/constants";
export * as GalleryConstants from "../app/gallery/constants";
export * as LettersConstants from "../app/letters/constants";
export * as DanceConstants from "../app/dance/constants";
export * as AuthConstants from "../components/AuthStatus/constants";
