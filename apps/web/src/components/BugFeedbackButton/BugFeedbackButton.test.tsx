// src/components/BugFeedbackButton.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "antd";
import { useSession } from "next-auth/react";
import useSWRMutation from "swr/mutation";
import BugFeedbackButton from ".";

// Mock dependencies
jest.mock("next-auth/react");
jest.mock("swr/mutation");
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseSWRMutation = useSWRMutation as jest.MockedFunction<
  typeof useSWRMutation
>;

// Mock App.useApp to prevent antd errors
const mockMessage = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
};

jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  App: {
    useApp: () => ({ message: mockMessage }),
  },
}));

// Wrapper component to provide Ant Design context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <App>{children}</App>;
};

describe("BugFeedbackButton", () => {
  const mockTrigger = jest.fn();
  const user = userEvent.setup();

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

  describe("Rendering", () => {
    it("should render the feedback button", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: jest.fn(),
      });

      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      expect(screen.getByText("🗂️ 反馈")).toBeInTheDocument();
    });

    it("should be positioned as fixed float element", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: jest.fn(),
      });

      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const container = screen.getByText("🗂️ 反馈").closest("div");
      expect(container).toHaveClass("fixed", "bottom-6", "right-6", "z-50");
    });
  });

  describe("Popover Interaction", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: "test@example.com" },
          expires: "2024-12-31T23:59:59.999Z",
        },
        status: "authenticated",
        update: jest.fn(),
      });
    });

    it("should open popover when button is clicked", async () => {
      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("🗂️ 反馈收集箱")).toBeInTheDocument();
      });
    });

    it("should display radio buttons for bug and idea types", async () => {
      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("🐛 Bug")).toBeInTheDocument();
        expect(screen.getByText("💡 Idea")).toBeInTheDocument();
      });
    });

    it("should display input fields in popover", async () => {
      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("简单描述问题或想法..."),
        ).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText("详细说明（可选）"),
        ).toBeInTheDocument();
      });
    });

    it("should display navigation link to lab page", async () => {
      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(() => {
        const link = screen.getByText("查看列表");
        expect(link).toBeInTheDocument();
        expect(link.closest("a")).toHaveAttribute("href", "/lab");
      });
    });
  });

  describe("Form Validation", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: "test@example.com" },
          expires: "2024-12-31T23:59:59.999Z",
        },
        status: "authenticated",
        update: jest.fn(),
      });
    });

    it("should disable submit button when title is empty", async () => {
      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(() => {
        const submitButton = screen.getByText("提交");
        expect(submitButton).toBeDisabled();
      });
    });

    it("should enable submit button when title is provided", async () => {
      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText("简单描述问题或想法...");
        const submitButton = screen.getByText("提交");

        fireEvent.change(titleInput, { target: { value: "Test issue" } });
        expect(submitButton).toBeEnabled();
      });
    });

    it("should show warning when trying to submit without login", async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: jest.fn(),
      });

      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(async () => {
        const titleInput = screen.getByPlaceholderText("简单描述问题或想法...");
        const submitButton = screen.getByText("提交");

        fireEvent.change(titleInput, { target: { value: "Test issue" } });
        await user.click(submitButton);

        expect(mockMessage.warning).toHaveBeenCalledWith("请先登录GitHub");
      });
    });
  });

  describe("Form Submission", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: "test@example.com" },
          expires: "2024-12-31T23:59:59.999Z",
        },
        status: "authenticated",
        update: jest.fn(),
      });
    });

    it("should submit with correct data for bug type", async () => {
      mockTrigger.mockResolvedValue({});

      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(async () => {
        const titleInput = screen.getByPlaceholderText("简单描述问题或想法...");
        const contentInput = screen.getByPlaceholderText("详细说明（可选）");
        const bugRadio = screen.getByLabelText("🐛 Bug");
        const submitButton = screen.getByText("提交");

        fireEvent.change(titleInput, { target: { value: "Test bug" } });
        fireEvent.change(contentInput, {
          target: { value: "Bug description" },
        });
        await user.click(bugRadio);
        await user.click(submitButton);

        expect(mockTrigger).toHaveBeenCalledWith({
          title: "Test bug",
          content: "Bug description",
          type: "bug",
          category: "tech",
          status: "open",
        });
      });
    });

    it("should submit with correct data for idea type", async () => {
      mockTrigger.mockResolvedValue({});

      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(async () => {
        const titleInput = screen.getByPlaceholderText("简单描述问题或想法...");
        const ideaRadio = screen.getByLabelText("💡 Idea");
        const submitButton = screen.getByText("提交");

        fireEvent.change(titleInput, { target: { value: "Test idea" } });
        await user.click(ideaRadio);
        await user.click(submitButton);

        expect(mockTrigger).toHaveBeenCalledWith({
          title: "Test idea",
          content: "",
          type: "idea",
          category: "tech",
          status: "open",
        });
      });
    });

    it("should show success message and reset form on successful submission", async () => {
      mockTrigger.mockResolvedValue({});

      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(async () => {
        const titleInput = screen.getByPlaceholderText("简单描述问题或想法...");
        const submitButton = screen.getByText("提交");

        fireEvent.change(titleInput, { target: { value: "Test issue" } });
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockMessage.success).toHaveBeenCalledWith("反馈提交成功！");
        });
      });
    });

    it("should show error message on submission failure", async () => {
      const error = new Error("Submission failed");
      mockTrigger.mockRejectedValue(error);

      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(async () => {
        const titleInput = screen.getByPlaceholderText("简单描述问题或想法...");
        const submitButton = screen.getByText("提交");

        fireEvent.change(titleInput, { target: { value: "Test issue" } });
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockMessage.error).toHaveBeenCalledWith("Submission failed");
        });
      });
    });
  });

  describe("Loading States", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: "test@example.com" },
          expires: "2024-12-31T23:59:59.999Z",
        },
        status: "authenticated",
        update: jest.fn(),
      });
    });

    it("should show loading state during submission", async () => {
      mockUseSWRMutation.mockReturnValue({
        trigger: mockTrigger,
        isMutating: true,
        error: undefined,
        data: undefined,
        reset: jest.fn(),
      });

      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: /提交/ });
        expect(submitButton).toHaveClass("ant-btn-loading");
      });
    });
  });

  describe("Authentication States", () => {
    it("should show login reminder for unauthenticated users", async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: jest.fn(),
      });

      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText("需要GitHub登录才能提交反馈"),
        ).toBeInTheDocument();
      });
    });

    it("should not show login reminder for authenticated users", async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: "test@example.com" },
          expires: "2024-12-31T23:59:59.999Z",
        },
        status: "authenticated",
        update: jest.fn(),
      });

      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.queryByText("需要GitHub登录才能提交反馈"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Input Constraints", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: "test@example.com" },
          expires: "2024-12-31T23:59:59.999Z",
        },
        status: "authenticated",
        update: jest.fn(),
      });
    });

    it("should enforce maxLength constraints on title input", async () => {
      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText(
          "简单描述问题或想法...",
        ) as HTMLInputElement;
        expect(titleInput.maxLength).toBe(100);
      });
    });

    it("should enforce maxLength constraints on content textarea", async () => {
      render(
        <TestWrapper>
          <BugFeedbackButton />
        </TestWrapper>,
      );

      const button = screen.getByText("🗂️ 反馈");
      await user.click(button);

      await waitFor(() => {
        const contentInput = screen.getByPlaceholderText(
          "详细说明（可选）",
        ) as HTMLTextAreaElement;
        expect(contentInput.maxLength).toBe(500);
      });
    });
  });
});
