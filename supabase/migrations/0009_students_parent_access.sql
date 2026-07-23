create policy "students_select_own_child" on public.students
for select to authenticated
using (
school_id = public.current_school_id()
and exists (
select 1 from public.parent_students ps
where ps.parent_id = auth.uid()
and ps.student_id = students.id
)
);
