# Original from RUC-NLPIR/EnvScaler @ c2aa25b45c3185e80e9cb2b919227cc912445abc
# MIT License, Copyright (c) 2026 RUC-NLPIR. See EnvScaler-LICENSE.txt.
from typing import Dict, List, TypedDict
from datetime import datetime



# Employee entity
class EmployeeInfo(TypedDict):
    employee_id: str
    name: str
    employment_status: str
    department: str
    eligibility_profile: str

# BenefitPlan entity
class BenefitPlanInfo(TypedDict):
    plan_id: str
    plan_type: str
    name: str
    coverage_details: str
    premiums: float
    eligibility_criteria: str

# EnrollmentPeriod entity
class EnrollmentPeriodInfo(TypedDict):
    enrollment_period_id: str
    start_date: str
    end_date: str
    is_active: bool

# EmployeePlanSelection entity
class EmployeePlanSelectionInfo(TypedDict):
    employee_id: str
    plan_id: str
    enrollment_period_id: str
    selection_date: str

class EmployeeBenefitsEnrollmentPortal:
    def __init__(self, init_config: dict):
        """
        Employee benefits enrollment portal environment.
        init_config: external configuration for initial state (not implemented yet).
        """

        # Employees: {employee_id: EmployeeInfo}
        self.employees: Dict[str, EmployeeInfo] = {}

        # Benefit Plans: {plan_id: BenefitPlanInfo}
        self.benefit_plans: Dict[str, BenefitPlanInfo] = {}

        # Enrollment Periods: {enrollment_period_id: EnrollmentPeriodInfo}
        self.enrollment_periods: Dict[str, EnrollmentPeriodInfo] = {}

        # Employee Plan Selections: {selection_id: EmployeePlanSelectionInfo}
        # Optionally, could use (employee_id, enrollment_period_id) composite keys — here, simple id assumed
        self.employee_plan_selections: Dict[str, EmployeePlanSelectionInfo] = {}

        # Constraints:
        # - Employees can only enroll in or modify plans during an active enrollment period.
        # - Employees can only see and enroll in benefit plans for which they are eligible.
        # - A plan’s eligibility_criteria must match an employee’s eligibility_profile to be shown as an option.

        self.init_config = init_config

    def get_employee_by_id(self, employee_id: str) -> dict:
        """
        Retrieve information for a specific employee by their unique ID.

        Args:
            employee_id (str): Unique identifier for the employee.

        Returns:
            dict: 
                - If employee exists:
                    { "success": True, "data": EmployeeInfo }
                - If employee does not exist:
                    { "success": False, "error": "Employee not found" }

        Constraints:
            - The employee_id must exist in the system.
        """
        employee = self.employees.get(employee_id)
        if not employee:
            return { "success": False, "error": "Employee not found" }
        return { "success": True, "data": employee }

    def list_active_enrollment_periods(self) -> dict:
        """
        Get all currently open enrollment periods where is_active == True.

        Args:
            None.

        Returns:
            dict: {
                "success": True,
                "data": List[EnrollmentPeriodInfo],  # List of active enrollment periods, or empty if none.
            }
        """
        active_periods = [
            period_info for period_info in self.enrollment_periods.values()
            if period_info.get("is_active", False)
        ]
        return {
            "success": True,
            "data": active_periods
        }

    def get_current_active_enrollment_period(self) -> dict:
        """
        Returns the currently active/open enrollment period if one exists.

        Args:
            None

        Returns:
            dict:
                - On success:
                    {
                        "success": True,
                        "data": EnrollmentPeriodInfo  # The info of the active period
                    }
                - On failure (no active period):
                    {
                        "success": False,
                        "error": "No active enrollment period."
                    }

        Constraints:
            - Ideally, only one enrollment period should have is_active == True.
            - If multiple, returns the first found active period.
        """
        for ep in self.enrollment_periods.values():
            if ep.get("is_active", False):
                return { "success": True, "data": ep }

        return { "success": False, "error": "No active enrollment period." }

    def get_employee_eligibility_profile(self, employee_id: str) -> dict:
        """
        Query the eligibility profile string of an employee.

        Args:
            employee_id (str): Unique identifier of the employee.

        Returns:
            dict:
                - On success: {"success": True, "data": str} (the eligibility_profile for the employee)
                - On error: {"success": False, "error": str} ('Employee not found')
    
        Constraints:
            - Employee must exist in self.employees.
        """
        employee = self.employees.get(employee_id)
        if employee is None:
            return { "success": False, "error": "Employee not found" }
        # Return the eligibility_profile (could be empty string)
        return { "success": True, "data": employee.get("eligibility_profile", "") }

    def list_all_benefit_plans(self) -> dict:
        """
        Retrieve all available benefit plans in the system (unfiltered by employee eligibility or plan type).

        Args:
            None

        Returns:
            dict: {
                "success": True,
                "data": List[BenefitPlanInfo],  # List of all benefit plans (may be empty if none exist)
            }
        """
        plans_list = list(self.benefit_plans.values())
        return { "success": True, "data": plans_list }

    def list_benefit_plans_by_type(self, plan_type: str) -> dict:
        """
        Get benefit plans filtered by plan_type.

        Args:
            plan_type (str): The type/category of benefits to filter by (e.g., "health insurance").

        Returns:
            dict: {
                "success": True,
                "data": List[BenefitPlanInfo],  # List of matching benefit plans
            }
            If no plans match, "data" is an empty list.

        Constraints:
            - No eligibility or enrollment period checks are enforced for this query.
            - Comparison is literal: only plans with BenefitPlanInfo["plan_type"] == plan_type are returned.
        """
        matching_plans = [
            plan for plan in self.benefit_plans.values()
            if plan["plan_type"] == plan_type
        ]

        return { "success": True, "data": matching_plans }

    def list_eligible_benefit_plans_for_employee(self, employee_id: str) -> dict:
        """
        List benefit plans that match the employee's eligibility profile and are available to them.

        Args:
            employee_id (str): ID of the employee.

        Returns:
            dict: 
              {
                "success": True,
                "data": List[BenefitPlanInfo]  # List of eligible benefit plans (may be empty)
              }
              OR
              {
                "success": False,
                "error": str  # Error message if employee does not exist
              }

        Constraints:
            - Only benefit plans whose eligibility_criteria match the employee's eligibility_profile are listed.
            - If employee does not exist, return an error.
        """
        employee = self.employees.get(employee_id)
        if not employee:
            return { "success": False, "error": "Employee not found" }

        eligibility_profile = employee["eligibility_profile"]

        eligible_plans = [
            plan for plan in self.benefit_plans.values()
            if plan["eligibility_criteria"] == eligibility_profile
        ]

        return { "success": True, "data": eligible_plans }

    def list_available_plan_options_for_employee_in_open_enrollment(self, employee_id: str) -> dict:
        """
        List benefit plans eligible for the specified employee and selectable in the current active enrollment period.

        Args:
            employee_id (str): The unique identifier for the employee.

        Returns:
            dict:
                - If successful: {
                      "success": True,
                      "data": List[BenefitPlanInfo]  # Eligible plans
                  }
                - If employee does not exist: {
                      "success": False,
                      "error": "Employee not found"
                  }
                - If no active enrollment period: {
                      "success": False,
                      "error": "No active enrollment period"
                  }

        Constraints:
            - Only plans where plan.eligibility_criteria == employee.eligibility_profile are shown.
            - Only active enrollment period(s) considered.
        """
        # Step 1: Validate employee
        employee = self.employees.get(employee_id)
        if not employee:
            return { "success": False, "error": "Employee not found" }

        # Step 2: Check for active enrollment period(s)
        active_periods = [
            period for period in self.enrollment_periods.values() if period.get("is_active", False)
        ]
        if not active_periods:
            return { "success": False, "error": "No active enrollment period" }

        # Step 3: Find eligible plans
        eligible_profile = employee.get("eligibility_profile")
        eligible_plans = [
            plan for plan in self.benefit_plans.values()
            if plan.get("eligibility_criteria") == eligible_profile
        ]

        return { "success": True, "data": eligible_plans }

    def get_plan_details(self, plan_id: str) -> dict:
        """
        Retrieve full details for a benefit plan by its plan_id.

        Args:
            plan_id (str): The identifier of the benefit plan.

        Returns:
            dict:
                - Success: { "success": True, "data": BenefitPlanInfo }
                - Failure: { "success": False, "error": "Benefit plan not found" }

        Constraints:
            - No constraints: Information retrieval only.
        """
        plan_info = self.benefit_plans.get(plan_id)
        if plan_info is None:
            return { "success": False, "error": "Benefit plan not found" }
        return { "success": True, "data": plan_info }

    def get_employee_plan_selections_in_period(
        self,
        employee_id: str,
        enrollment_period_id: str
    ) -> dict:
        """
        List all plan selections for a specific employee during a given enrollment period.

        Args:
            employee_id (str): Unique ID of the employee.
            enrollment_period_id (str): Unique ID of the enrollment period.

        Returns:
            dict: {
                "success": True,
                "data": List[EmployeePlanSelectionInfo]
            }
            or {
                "success": False,
                "error": str
            }

        Constraints:
            - employee_id must exist in self.employees.
            - enrollment_period_id must exist in self.enrollment_periods.
        """
        if employee_id not in self.employees:
            return { "success": False, "error": "Employee does not exist" }
        if enrollment_period_id not in self.enrollment_periods:
            return { "success": False, "error": "Enrollment period does not exist" }

        data = [
            selection for selection in self.employee_plan_selections.values()
            if selection["employee_id"] == employee_id and
               selection["enrollment_period_id"] == enrollment_period_id
        ]
        return { "success": True, "data": data }

    def get_employee_current_selection(self, employee_id: str) -> dict:
        """
        Get the currently active benefit plan selection for an employee (if any),
        during the currently active enrollment period.

        Args:
            employee_id (str): Unique employee identifier.

        Returns:
            dict:
                {
                    "success": True,
                    "data": EmployeePlanSelectionInfo | None  # Selection info or None if not found
                }
                OR
                {
                    "success": False,
                    "error": str  # Error description (employee not found, no active enrollment period)
                }

        Constraints:
            - Employee must exist.
            - There must be an active enrollment period.
        """
        # Check that employee exists
        if employee_id not in self.employees:
            return {"success": False, "error": "Employee not found"}

        # Find currently active enrollment period (assume only one active at any time)
        active_period_id = None
        for eid, period_info in self.enrollment_periods.items():
            if period_info.get("is_active"):
                active_period_id = eid
                break

        if active_period_id is None:
            return {"success": False, "error": "No active enrollment period"}

        # Look up employee's selection for this period
        for selection in self.employee_plan_selections.values():
            if (
                selection["employee_id"] == employee_id
                and selection["enrollment_period_id"] == active_period_id
            ):
                return {"success": True, "data": selection}

        # No selection found; return null data
        return {"success": True, "data": None}

    def enroll_employee_in_plan(
        self,
        employee_id: str,
        plan_id: str,
        enrollment_period_id: str,
        selection_date: str
    ) -> dict:
        """
        Add or update an employee’s plan selection during an active enrollment period.

        Args:
            employee_id (str): Employee’s unique ID.
            plan_id (str): Benefit plan’s unique ID.
            enrollment_period_id (str): Enrollment period’s unique ID.
            selection_date (str): Date/time of selection (ISO string).

        Returns:
            dict: {
                "success": True,
                "message": "Employee plan selection recorded/updated for enrollment period."
            }
            OR
            dict: {
                "success": False,
                "error": "<reason>"
            }

        Constraints:
            - Enrollment period must be active.
            - Employee, plan, and period must all exist.
            - Employee must be eligible for the plan.
        """

        # Check entities exist
        if employee_id not in self.employees:
            return { "success": False, "error": "Employee not found." }
        if plan_id not in self.benefit_plans:
            return { "success": False, "error": "Benefit plan not found." }
        if enrollment_period_id not in self.enrollment_periods:
            return { "success": False, "error": "Enrollment period not found." }

        # Check active enrollment period
        period = self.enrollment_periods[enrollment_period_id]
        if not period["is_active"]:
            return { "success": False, "error": "Enrollment period is not active." }

        # Check eligibility
        employee = self.employees[employee_id]
        plan = self.benefit_plans[plan_id]
        if employee["eligibility_profile"] != plan["eligibility_criteria"]:
            return { "success": False, "error": "Employee is not eligible for this plan." }

        # Check if selection exists and update; else, create new
        found_selection_id = None
        for selection_id, sel in self.employee_plan_selections.items():
            if (
                sel["employee_id"] == employee_id and
                sel["enrollment_period_id"] == enrollment_period_id
            ):
                found_selection_id = selection_id
                break

        if found_selection_id:
            # Update existing selection
            self.employee_plan_selections[found_selection_id]["plan_id"] = plan_id
            self.employee_plan_selections[found_selection_id]["selection_date"] = selection_date
            return { "success": True, "message": "Employee plan selection updated for enrollment period." }
        else:
            # Create new selection, selection_id can be new unique string (for demo, concatenate for uniqueness)
            selection_id = f"{employee_id}_{enrollment_period_id}"
            self.employee_plan_selections[selection_id] = {
                "employee_id": employee_id,
                "plan_id": plan_id,
                "enrollment_period_id": enrollment_period_id,
                "selection_date": selection_date
            }
            return { "success": True, "message": "Employee plan selection recorded for enrollment period." }


    def change_employee_plan_selection(self, employee_id: str, new_plan_id: str) -> dict:
        """
        Modify/replace the selected plan for an employee within the current active enrollment period.

        Args:
            employee_id (str): ID of the employee.
            new_plan_id (str): ID of the new plan to enroll in.

        Returns:
            dict: {
                "success": True,
                "message": "Employee's plan selection updated to new plan."
            }
            or
            {
                "success": False,
                "error": "Reason for failure."
            }

        Constraints:
            - Enrollment period must be active.
            - Employee and plan must exist.
            - Employee must be eligible for chosen plan.
            - Employee must already have a selection to modify for active period.
        """
        # Find the current active enrollment period
        active_period = None
        for period in self.enrollment_periods.values():
            if period.get("is_active", False):
                active_period = period
                break
        if not active_period:
            return { "success": False, "error": "No active enrollment period." }

        enrollment_period_id = active_period["enrollment_period_id"]

        # Confirm employee exists
        employee = self.employees.get(employee_id)
        if not employee:
            return { "success": False, "error": "Employee not found." }

        # Confirm plan exists
        new_plan = self.benefit_plans.get(new_plan_id)
        if not new_plan:
            return { "success": False, "error": "Plan not found." }

        # Check eligibility
        if new_plan["eligibility_criteria"] != employee["eligibility_profile"]:
            return { "success": False, "error": "Employee not eligible for this plan." }

        # Find existing selection for employee in this enrollment period
        selection_id = None
        for sel_id, plan_sel in self.employee_plan_selections.items():
            if (plan_sel["employee_id"] == employee_id and
                plan_sel["enrollment_period_id"] == enrollment_period_id):
                selection_id = sel_id
                break
        if not selection_id:
            return { "success": False, "error": "No existing plan selection found for employee in active enrollment period." }

        # Update selection
        self.employee_plan_selections[selection_id]["plan_id"] = new_plan_id
        self.employee_plan_selections[selection_id]["selection_date"] = datetime.utcnow().isoformat()

        return {
            "success": True,
            "message": "Employee's plan selection updated to new plan."
        }

    def withdraw_employee_plan_selection(self, employee_id: str) -> dict:
        """
        Removes/withdraws an employee's plan selection for the current active enrollment period (opts out).
    
        Args:
            employee_id (str): The ID of the employee wishing to withdraw their selection.
        
        Returns:
            dict: 
                On success:
                    {
                        "success": True,
                        "message": "Employee plan selection withdrawn for current enrollment period."
                    }
                On failure:
                    {
                        "success": False,
                        "error": str  # Description of why withdrawal was not possible
                    }
    
        Constraints:
            - There must be at least one active enrollment period.
            - The employee must exist.
            - Employee must have an existing plan selection in the current active enrollment period.
        """
        # Find the current active enrollment period
        current_periods = [
            ep for ep in self.enrollment_periods.values() if ep["is_active"]
        ]
        if not current_periods:
            return { "success": False, "error": "No active enrollment period." }

        # If multiple, pick the latest by end_date
        # Assuming 'end_date' is ISO format string. Sort descending by 'end_date'
        current_periods_sorted = sorted(
            current_periods,
            key=lambda ep: ep["end_date"],
            reverse=True
        )
        current_period = current_periods_sorted[0]
        period_id = current_period["enrollment_period_id"]

        # Validate employee exists
        if employee_id not in self.employees:
            return { "success": False, "error": "Employee not found." }

        # Find selection to withdraw
        selection_found = False
        selection_id_to_remove = None
        for selection_id, selection in self.employee_plan_selections.items():
            if (
                selection["employee_id"] == employee_id and 
                selection["enrollment_period_id"] == period_id
            ):
                selection_found = True
                selection_id_to_remove = selection_id
                break
        if not selection_found:
            return { "success": False, "error": "No plan selection found to withdraw for this employee in the current enrollment period." }
    
        # Remove the selection (withdraw)
        del self.employee_plan_selections[selection_id_to_remove]
        return { 
            "success": True,
            "message": "Employee plan selection withdrawn for current enrollment period."
        }

    def create_new_enrollment_period(
        self,
        enrollment_period_id: str,
        start_date: str,
        end_date: str,
        is_active: bool
    ) -> dict:
        """
        Add a new enrollment period to the portal (admin action).

        Args:
            enrollment_period_id (str): Unique ID for the enrollment period.
            start_date (str): Enrollment period start date (YYYY-MM-DD format recommended).
            end_date (str): Enrollment period end date (YYYY-MM-DD format recommended).
            is_active (bool): Whether the period is currently active.

        Returns:
            dict: Success or error message.
                {"success": True, "message": "Enrollment period created successfully."}
                or
                {"success": False, "error": "<reason>"}

        Constraints:
            - enrollment_period_id must be unique.
            - start_date should be ≤ end_date.
        """
        if enrollment_period_id in self.enrollment_periods:
            return {
                "success": False,
                "error": "Enrollment period ID already exists."
            }

        # Basic date validation: assume format is 'YYYY-MM-DD'
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            if start_dt > end_dt:
                return {
                    "success": False,
                    "error": "Start date must be before or equal to end date."
                }
        except Exception:
            return {
                "success": False,
                "error": "Invalid date format. Use YYYY-MM-DD."
            }

        # Add the new enrollment period entity
        self.enrollment_periods[enrollment_period_id] = {
            "enrollment_period_id": enrollment_period_id,
            "start_date": start_date,
            "end_date": end_date,
            "is_active": is_active,
        }

        return {
            "success": True,
            "message": "Enrollment period created successfully."
        }

    def activate_enrollment_period(self, enrollment_period_id: str) -> dict:
        """
        Set the status of an enrollment period to active ("is_active"=True).

        Args:
            enrollment_period_id (str): The unique ID of the enrollment period to activate.

        Returns:
            dict: {
                "success": True,
                "message": "Enrollment period <id> activated."
            }
            or
            {
                "success": False,
                "error": "<reason>"
            }

        Constraints:
            - Enrollment period must exist in the system to activate.
            - Idempotent: If already active, still considered success.
        """
        period = self.enrollment_periods.get(enrollment_period_id)
        if not period:
            return { "success": False, "error": "Enrollment period does not exist." }

        period["is_active"] = True
        return { 
            "success": True, 
            "message": f"Enrollment period {enrollment_period_id} activated."
        }

    def deactivate_enrollment_period(self, enrollment_period_id: str) -> dict:
        """
        Deactivate an enrollment period by setting its status to inactive.

        Args:
            enrollment_period_id (str): The unique ID of the enrollment period to deactivate.

        Returns:
            dict: 
                {
                    "success": True,
                    "message": "Enrollment period <id> deactivated."
                }
                OR
                {
                    "success": False,
                    "error": "Enrollment period does not exist."
                }
                OR
                {
                    "success": True,
                    "message": "Enrollment period <id> was already inactive."
                }

        Constraints:
            - Enrollment period must exist.
        """
        ep = self.enrollment_periods.get(enrollment_period_id)
        if ep is None:
            return { "success": False, "error": "Enrollment period does not exist." }
    
        if not ep["is_active"]:
            return { "success": True, "message": f"Enrollment period {enrollment_period_id} was already inactive." }
    
        ep["is_active"] = False
        return { "success": True, "message": f"Enrollment period {enrollment_period_id} deactivated." }

    def add_benefit_plan(
        self, 
        plan_id: str, 
        plan_type: str, 
        name: str, 
        coverage_details: str, 
        premiums: float, 
        eligibility_criteria: str
    ) -> dict:
        """
        Add a new benefit plan to the catalog.

        Args:
            plan_id (str): Unique identifier for the plan.
            plan_type (str): Category/type of the benefit plan.
            name (str): Name of the plan.
            coverage_details (str): Detailed coverage description.
            premiums (float): Cost of the plan.
            eligibility_criteria (str): Criteria for employee eligibility.

        Returns:
            dict: 
                - On success: {"success": True, "message": "Benefit plan added successfully."}
                - On failure: {"success": False, "error": <reason>}

        Constraints:
            - plan_id must be unique; cannot already exist.
            - premiums must be non-negative.
            - Required fields must be non-empty.
        """
        # Basic validation
        if not plan_id or not plan_type or not name or not coverage_details or not eligibility_criteria:
            return { "success": False, "error": "All fields must be provided and non-empty." }
        if premiums < 0:
            return { "success": False, "error": "Premiums must be non-negative." }
        if plan_id in self.benefit_plans:
            return { "success": False, "error": f"Benefit plan with id '{plan_id}' already exists." }

        new_plan: BenefitPlanInfo = {
            "plan_id": plan_id,
            "plan_type": plan_type,
            "name": name,
            "coverage_details": coverage_details,
            "premiums": premiums,
            "eligibility_criteria": eligibility_criteria
        }
        self.benefit_plans[plan_id] = new_plan
        return { "success": True, "message": "Benefit plan added successfully." }

    def update_benefit_plan(
        self, 
        plan_id: str, 
        plan_type: str = None,
        name: str = None,
        coverage_details: str = None,
        premiums: float = None,
        eligibility_criteria: str = None
    ) -> dict:
        """
        Modify the attributes/details of a benefit plan (admin action).

        Args:
            plan_id (str): Unique ID of the benefit plan to update.
            plan_type (Optional[str]): New type of the plan.
            name (Optional[str]): New display name for the plan.
            coverage_details (Optional[str]): New coverage description/details.
            premiums (Optional[float]): New premium amount (must be non-negative).
            eligibility_criteria (Optional[str]): New eligibility criteria string.

        Returns:
            dict: {
                "success": True,
                "message": "Benefit plan '<plan_id>' updated successfully."
            }
            or
            {
                "success": False,
                "error": str
            }

        Constraints:
            - Only existing plans can be updated.
            - Input should only update valid attributes of the plan.
            - Premiums must be non-negative if provided.
            - Must specify at least one attribute to change.
        """
        # Validate that the plan exists
        plan = self.benefit_plans.get(plan_id)
        if plan is None:
            return { "success": False, "error": f"Benefit plan '{plan_id}' does not exist." }

        updates = {}
        if plan_type is not None:
            updates["plan_type"] = plan_type
        if name is not None:
            updates["name"] = name
        if coverage_details is not None:
            updates["coverage_details"] = coverage_details
        if premiums is not None:
            if not isinstance(premiums, (int, float)):
                return { "success": False, "error": "Premiums must be a number." }
            if premiums < 0:
                return { "success": False, "error": "Premiums must be non-negative." }
            updates["premiums"] = premiums
        if eligibility_criteria is not None:
            updates["eligibility_criteria"] = eligibility_criteria

        if not updates:
            return { "success": False, "error": "No valid fields provided to update." }
    
        # Apply updates
        for key, value in updates.items():
            plan[key] = value
    
        return { "success": True, "message": f"Benefit plan '{plan_id}' updated successfully." }

    def remove_plan_from_employee_selection(
        self,
        employee_id: str,
        enrollment_period_id: str,
        plan_id: str
    ) -> dict:
        """
        Remove a specific benefit plan selection for an employee in a given enrollment period.

        Args:
            employee_id (str): Target employee's ID.
            enrollment_period_id (str): Target enrollment period ID.
            plan_id (str): Plan ID to remove from selection.

        Returns:
            dict: 
                Success -> {"success": True, "message": "..."}
                Failure -> {"success": False, "error": "..."}
    
        Constraints:
            - Employees can only modify plans during an active enrollment period.
            - Selection must exist for specified employee, period, and plan.
        """
        # Check enrollment period exists and is active
        period = self.enrollment_periods.get(enrollment_period_id)
        if not period:
            return { "success": False, "error": "Enrollment period does not exist." }
        if not period["is_active"]:
            return { "success": False, "error": "Enrollment period is not active; modifications are not allowed." }
    
        # Find the selection record matching all three attributes
        selection_id_to_remove = None
        for selection_id, selection in self.employee_plan_selections.items():
            if (selection["employee_id"] == employee_id and
                selection["enrollment_period_id"] == enrollment_period_id and
                selection["plan_id"] == plan_id):
                selection_id_to_remove = selection_id
                break

        if not selection_id_to_remove:
            return { "success": False, "error": "No matching plan selection found for this employee in the specified period." }
    
        del self.employee_plan_selections[selection_id_to_remove]
        return {
            "success": True,
            "message": (f"Plan selection for employee '{employee_id}' "
                        f"in period '{enrollment_period_id}' for plan '{plan_id}' has been removed.")
        }
