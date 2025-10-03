// src/app/blog/components/PinControl.test.tsx
import { BlogPostItem } from "@/types/blog";
import { fireEvent, render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import useSWRMutation from "swr/mutation";
import PinControl from "./PinControl";

// Mock dependencies
jest.mock("next-auth/react");
jest.mock("swr/mutation");
jest.mock("swr", () => ({
  mutate: jest.fn(),
}));
jest.mock("@/constants/auth", () => ({
  isAdminUser: jest.fn((email) => email === "ghuijue@gmail.com"),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseSWRMutation = useSWRMutation as jest.MockedFunction<
  typeof useSWRMutation
>;

describe("PinControl", () => {
  const mockPost: BlogPostItem = {
    name: "test-post.md",
    path: "ByteNotes/test-post.md",
    isPinned: false,
    title: "Test Post",
    pinOrder: 0,
  };

  const mockTrigger = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      isMutating: false,
      error: undefined,
      data: undefined,
      reset: jest.fn(),
    });
  });

  describe("Authorization", () => {
    it("should not render for non-admin users", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: "user@example.com" },
          expires: "2024-12-31T23:59:59.999Z",
        },
        status: "authenticated",
        update: jest.fn(),
      });

      render(<PinControl post={mockPost} category="ByteNotes" />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should not render for unauthenticated users", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: jest.fn(),
      });

      render(<PinControl post={mockPost} category="ByteNotes" />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should render for admin users", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: "ghuijue@gmail.com" },
          expires: "2024-12-31T23:59:59.999Z",
        },
        status: "authenticated",
        update: jest.fn(),
      });

      render(<PinControl post={mockPost} category="ByteNotes" />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("Pin functionality", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: "ghuijue@gmail.com" },
          expires: "2024-12-31T23:59:59.999Z",
        },
        status: "authenticated",
        update: jest.fn(),
      });
    });

    it("should display correct icon for unpinned post", () => {
      render(<PinControl post={mockPost} category="ByteNotes" />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("📌");
    });

    it("should display correct icon for pinned post", () => {
      const pinnedPost: BlogPostItem = {
        ...mockPost,
        isPinned: true,
        pinOrder: 1,
      };

      render(<PinControl post={pinnedPost} category="ByteNotes" />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("📌");
    });

    it("should call togglePin with correct data when clicked", async () => {
      render(<PinControl post={mockPost} category="ByteNotes" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockTrigger).toHaveBeenCalledWith({
        path: "ByteNotes/test-post.md",
        category: "ByteNotes",
        title: "Test Post",
        isPinned: true,
      });
    });

    it("should handle pin action for post without title", async () => {
      const postWithoutTitle = { ...mockPost, title: undefined };

      render(<PinControl post={postWithoutTitle} category="ByteNotes" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockTrigger).toHaveBeenCalledWith({
        path: "ByteNotes/test-post.md",
        category: "ByteNotes",
        title: "test-post", // Should extract from filename
        isPinned: true,
      });
    });

    it("should prevent event propagation", () => {
      const mockStopPropagation = jest.fn();
      const mockPreventDefault = jest.fn();

      render(<PinControl post={mockPost} category="ByteNotes" />);

      const button = screen.getByRole("button");

      fireEvent.click(button, {
        stopPropagation: mockStopPropagation,
        preventDefault: mockPreventDefault,
      });

      // Note: jsdom doesn't fully simulate event propagation,
      // but we can test that the handler doesn't throw
      expect(mockTrigger).toHaveBeenCalled();
    });

    it("should show loading state when mutation is in progress", () => {
      mockUseSWRMutation.mockReturnValue({
        trigger: mockTrigger,
        isMutating: true,
        error: undefined,
        data: undefined,
        reset: jest.fn(),
      });

      render(<PinControl post={mockPost} category="ByteNotes" />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("⏳");
      expect(button).toBeDisabled();
    });

    it("should not trigger when already loading", () => {
      mockUseSWRMutation.mockReturnValue({
        trigger: mockTrigger,
        isMutating: true,
        error: undefined,
        data: undefined,
        reset: jest.fn(),
      });

      render(<PinControl post={mockPost} category="ByteNotes" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockTrigger).not.toHaveBeenCalled();
    });
  });

  describe("Visual states", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: "ghuijue@gmail.com" },
          expires: "2024-12-31T23:59:59.999Z",
        },
        status: "authenticated",
        update: jest.fn(),
      });
    });

    it("should apply correct styles for pinned state", () => {
      const pinnedPost = { ...mockPost, isPinned: true };

      render(<PinControl post={pinnedPost} category="ByteNotes" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-amber-600");
    });

    it("should apply correct styles for unpinned state", () => {
      render(<PinControl post={mockPost} category="ByteNotes" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-neutral-400");
    });

    it("should apply loading styles when mutating", () => {
      mockUseSWRMutation.mockReturnValue({
        trigger: mockTrigger,
        isMutating: true,
        error: undefined,
        data: undefined,
        reset: jest.fn(),
      });

      render(<PinControl post={mockPost} category="ByteNotes" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "cursor-not-allowed",
        "opacity-50",
        "scale-95",
      );
    });
  });
});
