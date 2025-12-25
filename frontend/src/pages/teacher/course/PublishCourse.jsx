import { useParams } from "react-router-dom";
import { publishCourse } from "../../../api/course";

export default function PublishCourse() {
  const { courseID } = useParams();

  return (
    <button onClick={() => publishCourse(courseID)}>
      Publish Course
    </button>
  );
}
