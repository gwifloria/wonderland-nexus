import { postFetcher } from "@/util/fetch";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

interface Schedule {
  scheduleid: string | number;
  teachername: string;
  projectname: string;
}
export const useOneway = () => {
  const { data, isLoading } = useSWR<Schedule[]>("/floria-service/oneway/list");

  const { trigger: subscribe } = useSWRMutation(
    "/floria-service/oneway/subscribe",
    postFetcher,
  );

  const { trigger: unsubscribe } = useSWRMutation(
    "/floria-service/oneway/unsubscribe",
    postFetcher,
  );

  const schedules = data?.map((item) => ({
    courseId: item.scheduleid,
    teacherName: item.teachername,
    courseName: item.projectname,
  }));

  return {
    schedules: schedules,
    isLoading,
    subscribe: (courseId: string) => subscribe({ courseId }),
    unsubscribe: (courseId: string) => unsubscribe({ courseId }),
  };
};
