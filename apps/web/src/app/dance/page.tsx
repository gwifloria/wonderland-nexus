"use client";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { Empty, Input, Select, Spin, Tabs } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { CourseItem } from "./CourseItem";
import { useCaster } from "./useCaster";
import { useOneway } from "./useOneway";

const CourseList = ({
  courses,
  subscribe,
  unsubscribe,
  isLoading,
}: {
  courses?: Array<any>;
  subscribe: Function;
  unsubscribe: Function;
  isLoading?: boolean;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("time");

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses
      .filter(
        (course) =>
          course.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "time") {
          return new Date(a.startTime || "") > new Date(b.startTime || "")
            ? 1
            : -1;
        }
        return a.teacherName.localeCompare(b.teacherName);
      });
  }, [courses, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  if (!courses?.length) {
    return <Empty description="No courses available" className="py-8" />;
  }

  return (
    <div className="space-y-4" data-testid="course-list">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
        <div className="flex-1">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search by teacher or course name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            allowClear
          />
        </div>
        <Select
          value={sortBy}
          onChange={setSortBy}
          className="w-32"
          options={[
            { label: "Sort by Time", value: "time" },
            { label: "Sort by Teacher", value: "teacher" },
          ]}
          suffixIcon={<FilterOutlined />}
        />
      </div>

      <AnimatePresence>
        <div className="grid gap-3 p-4">
          {filteredCourses.map((item) => (
            <motion.div
              key={item.courseId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CourseItem
                course={item}
                unsubscribe={unsubscribe}
                subscribe={subscribe}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default function DanceBooking() {
  const {
    schedules: casterSchedules,
    subscribe: casterSubscribe,
    unsubscribe: casterUnsubscribe,
    isLoading: isCasterLoading,
  } = useCaster();

  const {
    schedules: onewaySchedules,
    subscribe: onewaySubscribe,
    unsubscribe: onewayUnsubscribe,
    isLoading: isOnewayLoading,
  } = useOneway();
  const casterTabItem = useMemo(
    () => ({
      key: "caster",
      label: "Caster Studio",
      children: (
        <CourseList
          courses={casterSchedules}
          subscribe={casterSubscribe}
          unsubscribe={casterUnsubscribe}
          isLoading={isCasterLoading}
        />
      ),
    }),
    [casterSchedules, casterSubscribe, casterUnsubscribe, isCasterLoading]
  );

  const onewayTabItem = useMemo(
    () => ({
      key: "oneway",
      label: "One Way",
      children: (
        <CourseList
          courses={onewaySchedules}
          subscribe={onewaySubscribe}
          unsubscribe={onewayUnsubscribe}
          isLoading={isOnewayLoading}
        />
      ),
    }),
    [onewaySchedules, onewaySubscribe, onewayUnsubscribe, isOnewayLoading]
  );

  const items = [casterTabItem, onewayTabItem];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dance Class Booking
      </h1>
      <h2 className="text-gray-600 mb-8 text-lg">
        Automatically monitor and subscribe to available dance class seats to
        save time on manual checking(personal use only)
      </h2>
      <Tabs
        items={items}
        className="bg-white rounded-lg shadow-sm p-4"
        tabBarStyle={{
          marginBottom: 24,
          padding: "0 16px",
        }}
        tabBarGutter={32}
      />
    </div>
  );
}
