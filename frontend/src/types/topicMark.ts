
export interface Course {
    id: string;
    courseName: string;
    courseCode: string;
}

export interface Trainer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}
export interface CourseClasses {
    id: string;
    course: Course;
    trainer: Trainer;
    createdAt: string;
    updatedAt: string;
}
