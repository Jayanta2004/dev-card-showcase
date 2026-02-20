        // DOM elements
        const calculateBtn = document.getElementById('calculateBtn');
        const resetBtn = document.getElementById('resetBtn');
        const payPeriodButtons = document.querySelectorAll('.pay-period-selector button');
        
        // Input elements
        const employeeNameInput = document.getElementById('employeeName');
        const payRateInput = document.getElementById('payRate');
        const hoursWorkedInput = document.getElementById('hoursWorked');
        const overtimeHoursInput = document.getElementById('overtimeHours');
        const overtimeEnabledCheckbox = document.getElementById('overtimeEnabled');
        const federalTaxInput = document.getElementById('federalTax');
        const stateTaxInput = document.getElementById('stateTax');
        const socialSecurityInput = document.getElementById('socialSecurity');
        const medicareInput = document.getElementById('medicare');
        const otherDeductionsInput = document.getElementById('otherDeductions');
        
        // Result display elements
        const resultEmployeeName = document.getElementById('resultEmployeeName');
        const resultPayPeriod = document.getElementById('resultPayPeriod');
        const grossPayElement = document.getElementById('grossPay');
        const taxTotalElement = document.getElementById('taxTotal');
        const deductionsTotalElement = document.getElementById('deductionsTotal');
        const netPayElement = document.getElementById('netPay');
        const regularPayElement = document.getElementById('regularPay');
        const overtimePayElement = document.getElementById('overtimePay');
        const federalTaxAmountElement = document.getElementById('federalTaxAmount');
        const stateTaxAmountElement = document.getElementById('stateTaxAmount');
        const socialSecurityAmountElement = document.getElementById('socialSecurityAmount');
        const medicareAmountElement = document.getElementById('medicareAmount');
        const otherDeductionsAmountElement = document.getElementById('otherDeductionsAmount');
        const netPayBreakdownElement = document.getElementById('netPayBreakdown');
        
        // Current pay period
        let currentPayPeriod = 'hourly';
        
        // Set current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        // Initialize with a calculation
        document.addEventListener('DOMContentLoaded', function() {
            calculatePayroll();
        });
        
        // Pay period selector
        payPeriodButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                payPeriodButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update current pay period
                currentPayPeriod = this.getAttribute('data-period');
                resultPayPeriod.textContent = this.textContent;
                
                // Recalculate with new pay period
                calculatePayroll();
            });
        });
        
        // Calculate payroll
        calculateBtn.addEventListener('click', calculatePayroll);
        
        function calculatePayroll() {
            // Get input values
            const employeeName = employeeNameInput.value || "Employee";
            const payRate = parseFloat(payRateInput.value) || 0;
            const hoursWorked = parseFloat(hoursWorkedInput.value) || 0;
            const overtimeHours = overtimeEnabledCheckbox.checked ? (parseFloat(overtimeHoursInput.value) || 0) : 0;
            const federalTaxRate = parseFloat(federalTaxInput.value) || 0;
            const stateTaxRate = parseFloat(stateTaxInput.value) || 0;
            const socialSecurityRate = parseFloat(socialSecurityInput.value) || 0;
            const medicareRate = parseFloat(medicareInput.value) || 0;
            const otherDeductions = parseFloat(otherDeductionsInput.value) || 0;
            
            // Update employee name and pay period
            resultEmployeeName.textContent = employeeName;
            
            // Calculate pay based on period
            let hourlyRate = payRate;
            
            // Convert to hourly rate if pay period is not hourly
            switch(currentPayPeriod) {
                case 'weekly':
                    hourlyRate = payRate / 40; // Assuming 40-hour work week
                    break;
                case 'biweekly':
                    hourlyRate = payRate / 80; // Assuming 80 hours per bi-weekly period
                    break;
                case 'monthly':
                    hourlyRate = payRate / 173.33; // Approx hours in a month (40 hrs/week * 52 weeks / 12 months)
                    break;
                case 'annually':
                    hourlyRate = payRate / 2080; // 40 hrs/week * 52 weeks
                    break;
                default:
                    // Hourly - no conversion needed
                    break;
            }
            
            // Calculate regular pay
            const regularPay = hoursWorked * hourlyRate;
            
            // Calculate overtime pay (1.5x hourly rate)
            const overtimePay = overtimeHours * (hourlyRate * 1.5);
            
            // Calculate gross pay
            const grossPay = regularPay + overtimePay;
            
            // Calculate deductions
            const federalTaxAmount = grossPay * (federalTaxRate / 100);
            const stateTaxAmount = grossPay * (stateTaxRate / 100);
            const socialSecurityAmount = grossPay * (socialSecurityRate / 100);
            const medicareAmount = grossPay * (medicareRate / 100);
            
            // Calculate totals
            const taxTotal = federalTaxAmount + stateTaxAmount + socialSecurityAmount + medicareAmount;
            const deductionsTotal = otherDeductions;
            const netPay = grossPay - taxTotal - deductionsTotal;
            
            // Update results in UI
            updateResults(
                grossPay, 
                taxTotal, 
                deductionsTotal, 
                netPay,
                regularPay,
                overtimePay,
                federalTaxAmount,
                stateTaxAmount,
                socialSecurityAmount,
                medicareAmount,
                otherDeductions
            );
        }
        
        // Update all result elements
        function updateResults(
            grossPay, 
            taxTotal, 
            deductionsTotal, 
            netPay,
            regularPay,
            overtimePay,
            federalTaxAmount,
            stateTaxAmount,
            socialSecurityAmount,
            medicareAmount,
            otherDeductions
        ) {
            // Format currency
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            });
            
            // Update main result cards
            grossPayElement.textContent = formatter.format(grossPay);
            taxTotalElement.textContent = formatter.format(taxTotal);
            deductionsTotalElement.textContent = formatter.format(deductionsTotal);
            netPayElement.textContent = formatter.format(netPay);
            
            // Update breakdown
            regularPayElement.textContent = formatter.format(regularPay);
            overtimePayElement.textContent = formatter.format(overtimePay);
            federalTaxAmountElement.textContent = formatter.format(federalTaxAmount);
            stateTaxAmountElement.textContent = formatter.format(stateTaxAmount);
            socialSecurityAmountElement.textContent = formatter.format(socialSecurityAmount);
            medicareAmountElement.textContent = formatter.format(medicareAmount);
            otherDeductionsAmountElement.textContent = formatter.format(otherDeductions);
            netPayBreakdownElement.textContent = formatter.format(netPay);
        }
        
        // Reset form
        resetBtn.addEventListener('click', function() {
            employeeNameInput.value = "John Smith";
            payRateInput.value = "25.00";
            hoursWorkedInput.value = "40";
            overtimeHoursInput.value = "5";
            overtimeEnabledCheckbox.checked = true;
            federalTaxInput.value = "12";
            stateTaxInput.value = "5";
            socialSecurityInput.value = "6.2";
            medicareInput.value = "1.45";
            otherDeductionsInput.value = "50.00";
            
            // Reset pay period to hourly
            payPeriodButtons.forEach(btn => btn.classList.remove('active'));
            payPeriodButtons[0].classList.add('active');
            currentPayPeriod = 'hourly';
            resultPayPeriod.textContent = 'Hourly';
            
            // Recalculate with default values
            calculatePayroll();
        });
        
        // Recalculate when any input changes
        const allInputs = document.querySelectorAll('input, select');
        allInputs.forEach(input => {
            input.addEventListener('input', calculatePayroll);
        });
        
        // Toggle overtime
        overtimeEnabledCheckbox.addEventListener('change', function() {
            overtimeHoursInput.disabled = !this.checked;
            calculatePayroll();
        });