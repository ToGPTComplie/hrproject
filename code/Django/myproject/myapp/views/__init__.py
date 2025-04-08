from .login import user_login, user_logout
from .home import home
from .employee import (
     employee_detail, 
    employee_add, employee_edit,employee_home,
)
from .attendance import attendance_record, attendance_stats
from .salary import salary_list, salary_detail, salary_add
from .department import department_list, department_detail
from .task import task_list, task_detail, task_add, task_update
from .message import message_list, message_detail
from .recruitment import (
    job_application_form, job_application_success,
    job_application_list, get_positions
)
from .profile import profile
from .employee_list import employee_list