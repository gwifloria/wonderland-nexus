import { Button } from "antd";

export const CourseItem = ({
  course,
  subscribe,
  unsubscribe,
}: {
  course: {
    courseName: string;
    teacherName: string;
    courseId: string | number;
    startTime?: string;
  };
  subscribe: Function;
  unsubscribe: Function;
}) => {
  return (
    <div className="bg-white rounded-md shadow-sm hover:shadow transition-shadow duration-200 p-4 mb-3 border border-gray-100">
      <div className="grid grid-cols-[auto,1fr,auto] gap-4 items-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-mint-500 text-sm">👩‍🏫</span>
          <span className="text-xs text-gray-600">{course.teacherName}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-900">
            {course.courseName}
          </span>
          {course.startTime && (
            <span className="text-xs text-gray-600">⏰ {course.startTime}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => subscribe(course.courseId)}
            className="bg-mint-500 hover:bg-mint-600 text-white border-none"
            type="primary"
            size="small"
          >
            Subscribe
          </Button>
          <Button
            onClick={() => unsubscribe(course.courseId)}
            className="border-mint-500 hover:border-mint-600 text-mint-500 hover:text-mint-600"
            size="small"
          >
            Unsubscribe
          </Button>
        </div>
      </div>
    </div>
  );
};
