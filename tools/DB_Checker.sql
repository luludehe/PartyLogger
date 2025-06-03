-- Étudiants dans la base mais pas dans le fichier
SELECT * FROM Student
WHERE studentId NOT IN (SELECT studentId FROM tmp_students_import);

-- Étudiants dans le fichier mais pas encore en base
SELECT * FROM tmp_students_import
WHERE studentId NOT IN (SELECT studentId FROM Student);
