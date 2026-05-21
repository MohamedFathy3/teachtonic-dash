import { About } from "./about.types";
import { Book } from "./book.types";
import { Feature } from "./feature.types";
import { Footer } from "./footer.types";
import { Stage } from "./stage.types";
import { Subject } from "./subject.types";
export interface TeacherImage {
    id: number;
    name: string;
    mimeType: string;
    size: number;
    previewUrl: string;
    fullUrl: string;
    createdAt: string;
}

export interface Semester {
    id: number;
    name: string;
    name_ar: string;
    active: boolean;
    price: string;
    discount: string;
    teacher_id: number;
    subject_id: number | null;
    createdAt: string;
}

export interface ExamQuestion {
    id: number;
    exam_id: number;
    question_type: string;
    question: string;
    mark: string;
    image: string | null;
    correct_answer?: string;
}

export interface Exam {
    id: number;
    title: string;
    description: string;
    type: string;
    questions: ExamQuestion[];
    total_marks: number;
    duration_minutes: number;
    imageUrl: string;
}

export interface CourseDetail {
    id: number;
    course_id: number;
    title: string;
    description: string;
    content_link: string;
    lession_date: string;
    lession_time: string;
    price: string;
    must_pass_to_unlock: boolean;
    exams: Exam[];
    assignments: [];
    attended: boolean;
    createdAt: string;
}

export interface TeacherCourse {
    id: number;
    teacher_id: number;
    stage_id: number;
    subject_id: number;
    semester_id: number;

    semester: Semester;

    title: string;
    title_ar: string;

    description: string;
    description_ar: string;

    about: string;
    about_ar: string;

    price: string;
    discount: string;
    price_before_discount: number;

    type: string;
    count_student: number;

    start_date: string;
    end_date: string;

    active: number;

    imageUrl: string;

    image: TeacherImage;

    details: CourseDetail[];

    createdAt: string;
}
export interface TeacherResponse {
    id: number;
    name: string;
    email: string;
    website: {
        courses: TeacherCourse[];
        about: About;
        features: Feature[];
        stages: Stage[];
        subjects: Subject[];
        books: Book[];
        footer: Footer;
    };
}