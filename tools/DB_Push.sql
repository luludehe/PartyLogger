-- Supprimer les anciens étudiants (plus présents dans le fichier)
DELETE FROM Student
WHERE studentId NOT IN (SELECT studentId FROM tmp_students_import);

-- Ajouter les nouveaux étudiants (si pas déjà en base)
INSERT INTO Student (studentId, last_name, first_name, speciality, isMember)
SELECT t.studentId, t.last_name, t.first_name, t.speciality, t.isMember
FROM tmp_students_import t
         LEFT JOIN Student s ON s.studentId = t.studentId
WHERE s.id IS NULL;
