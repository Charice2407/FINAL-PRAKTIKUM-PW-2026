
-- =====================================================
-- LEARN WITH GLENN (LWG)
-- Database: learn_with_glenn
-- =====================================================

-- 1. Tabel pengguna
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    teacher_status VARCHAR(20),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_role_check
        CHECK (role IN ('admin', 'teacher', 'student')),

    CONSTRAINT users_teacher_status_check
        CHECK (
            teacher_status IS NULL OR
            teacher_status IN ('pending', 'approved', 'rejected')
        )
);

-- 2. Tabel kategori kursus
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel kursus
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    thumbnail TEXT,
    category_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_course_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_course_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT course_date_check
        CHECK (
            start_date IS NULL OR
            end_date IS NULL OR
            end_date >= start_date
        )
);

-- 4. Tabel materi pembelajaran
CREATE TABLE contents (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_content_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    CONSTRAINT content_order_check
        CHECK (order_index > 0),

    CONSTRAINT unique_course_order
        UNIQUE (course_id, order_index)
);

-- 5. Tabel pendaftaran kursus
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_enrollment_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enrollment_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_student_course
        UNIQUE (student_id, course_id)
);

-- 6. Tabel progres materi
CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL,
    content_id INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_progress_enrollment
        FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_progress_content
        FOREIGN KEY (content_id)
        REFERENCES contents(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_lesson_progress
        UNIQUE (enrollment_id, content_id)
);

-- 7. Tabel forum diskusi
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comment_content
        FOREIGN KEY (content_id)
        REFERENCES contents(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT comment_message_check
        CHECK (LENGTH(TRIM(message)) > 0)
);

-- 8. Index untuk mempercepat pencarian
CREATE INDEX idx_courses_category
    ON courses(category_id);

CREATE INDEX idx_courses_teacher
    ON courses(teacher_id);

CREATE INDEX idx_contents_course
    ON contents(course_id);

CREATE INDEX idx_enrollments_student
    ON enrollments(student_id);

CREATE INDEX idx_progress_enrollment
    ON lesson_progress(enrollment_id);

CREATE INDEX idx_comments_content
    ON comments(content_id);

-- =====================================================
-- END OF LWG DATABASE
-- =====================================================
