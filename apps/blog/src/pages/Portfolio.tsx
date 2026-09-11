import { useEffect, useState } from "react";

import type { Course } from "../types";
import { getHome } from "../apis/home";
import CourseCard from "../components/CourseCard";
import SectionHeader from "../components/SectionHeader";
import Loader from "../components/Loader";
import { EmptyState } from "@repo/shared";

export default function Portfolio() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getHome()
      .then((res) => {
        if (!active) return;
        const featured = [...(res.data.introductoryCourses ?? []), ...(res.data.recommendedCourses ?? [])];
        const deduped = [...new Map(featured.map((c) => [c.id, c])).values()];
        setCourses(deduped);
      })
      .catch(() => {
        if (active) setCourses([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeader code="PORTFOLIO" title="个人作品集" desc="创作者主推的入门与旗舰作品,点击进入详情查看章节。" />

      {loading ? (
        <Loader />
      ) : courses.length === 0 ? (
        <EmptyState code="PORTFOLIO" title="暂无作品" description="还未有推荐 / 入门课程作为作品展示。" />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
