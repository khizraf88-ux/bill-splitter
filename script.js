// DOM Elements
const billInput = document.getElementById('bill-amount');
const tipBtns = document.querySelectorAll('.tip-btn');
const customTipInput = document.getElementById('custom-tip');
const peopleInput = document.getElementById('people-count');
const resetBtn = document.getElementById('reset-btn');

// Display Elements
const tipAmountDisplay = document.getElementById('tip-amount-display');
const grandTotalDisplay = document.getElementById('grand-total-display');
const perPersonDisplay = document.getElementById('per-person-display');

// Error Elements
const billError = document.getElementById('bill-error');
const tipError = document.getElementById('tip-error');
const peopleError = document.getElementById('people-error');

// State
let currentTipPercentage = 15; // Default tip percentage

/**
 * Validates the inputs and displays errors if needed.
 * Returns true if all valid, false otherwise.
 */
function validateInputs() {
    let isValid = true;

    // Bill validation
    const billRaw = billInput.value.trim();
    if (billRaw === '') {
        // Empty is fine, just calculate as 0 internally without error
        clearError(billInput, billError);
    } else {
        const billValue = parseFloat(billRaw);
        if (isNaN(billValue) || billValue <= 0) {
            showError(billInput, billError, "Bill amount must be greater than 0");
            isValid = false;
        } else if (billValue > 1000000000) {
            showError(billInput, billError, "Amount is too large");
            isValid = false;
        } else {
            clearError(billInput, billError);
        }
    }

    // Tip validation
    const customTipRaw = customTipInput.value.trim();
    if (customTipRaw !== '') {
        const customTipValue = parseFloat(customTipRaw);
        if (isNaN(customTipValue) || customTipValue < 0 || customTipValue > 100) {
            showError(customTipInput, tipError, "Tip must be between 0 and 100");
            isValid = false;
        } else {
            clearError(customTipInput, tipError);
            currentTipPercentage = customTipValue;
        }
    } else {
        clearError(customTipInput, tipError);
    }

    // People validation
    const peopleRaw = peopleInput.value.trim();
    if (peopleRaw === '') {
        // Empty is handled as 1 silently
        clearError(peopleInput, peopleError);
    } else {
        const peopleValue = parseFloat(peopleRaw);
        if (isNaN(peopleValue) || peopleValue < 1 || !Number.isInteger(peopleValue)) {
            showError(peopleInput, peopleError, "Number of people must be at least 1");
            isValid = false;
        } else if (peopleValue > 1000000) {
            showError(peopleInput, peopleError, "Number of people is too large");
            isValid = false;
        } else {
            clearError(peopleInput, peopleError);
        }
    }

    return isValid;
}

/**
 * Performs the core calculations and updates the DOM
 */
function calculateTip() {
    if (!validateInputs()) {
        resetDisplay();
        return;
    }

    const billRaw = billInput.value.trim();
    const bill = billRaw !== '' ? parseFloat(billRaw) : 0;

    // If bill is 0 (like empty input handled safely), we can just show 0 everywhere
    if (bill === 0) {
        resetDisplay();
        return; 
    }

    const peopleRaw = peopleInput.value.trim();
    const people = peopleRaw !== '' ? parseInt(peopleRaw) : 1;

    const tipPercentage = currentTipPercentage;

    const tipAmount = (bill * tipPercentage) / 100;
    const grandTotal = bill + tipAmount;
    const perPerson = grandTotal / people;

    // Update UI
    tipAmountDisplay.textContent = formatCurrency(tipAmount);
    grandTotalDisplay.textContent = formatCurrency(grandTotal);
    perPersonDisplay.textContent = formatCurrency(perPerson);
}

/**
 * Formats a number into Rs currency string rounded to 2 decimals
 */
function formatCurrency(num) {
    return `Rs ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Resets the display back to Rs 0.00
 */
function resetDisplay() {
    tipAmountDisplay.textContent = 'Rs 0.00';
    grandTotalDisplay.textContent = 'Rs 0.00';
    perPersonDisplay.textContent = 'Rs 0.00';
}

/**
 * Handles preset tip button clicks
 */
function handleTipClick(e) {
    // Remove active class from all buttons
    tipBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });

    // Clear custom input since we are selecting a preset
    customTipInput.value = '';
    clearError(customTipInput, tipError);

    // Set active class and update tip
    e.target.classList.add('active');
    e.target.setAttribute('aria-pressed', 'true');
    currentTipPercentage = parseFloat(e.target.dataset.tip);

    calculateTip();
}

/**
 * Handles custom tip input
 */
function handleCustomTip() {
    if (customTipInput.value.trim() !== '') {
        // Remove active class from preset buttons
        tipBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
    } else {
        // If cleared, default back to 15% silently
        currentTipPercentage = 15;
        const defaultBtn = document.querySelector('[data-tip="15"]');
        defaultBtn.classList.add('active');
        defaultBtn.setAttribute('aria-pressed', 'true');
        clearError(customTipInput, tipError);
    }

    calculateTip();
}

/**
 * Resets the entire app state
 */
function resetApp() {
    // Clear inputs
    billInput.value = '';
    customTipInput.value = '';
    peopleInput.value = '1';

    // Clear errors
    clearError(billInput, billError);
    clearError(customTipInput, tipError);
    clearError(peopleInput, peopleError);

    // Reset tip to 15% default
    tipBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    const defaultBtn = document.querySelector('[data-tip="15"]');
    defaultBtn.classList.add('active');
    defaultBtn.setAttribute('aria-pressed', 'true');
    currentTipPercentage = 15;

    resetDisplay();
}

/**
 * Helper to show validation error
 */
function showError(input, errorElement, msg) {
    input.closest('.input-group').classList.add('input-error');
    errorElement.textContent = msg;
}

/**
 * Helper to clear validation error
 */
function clearError(input, errorElement) {
    input.closest('.input-group').classList.remove('input-error');
    // Note: Do not clear textContent immediately to allow smooth fade out transition
}

// Event Listeners for Live Calculation
billInput.addEventListener('input', calculateTip);
peopleInput.addEventListener('input', calculateTip);
customTipInput.addEventListener('input', handleCustomTip);
resetBtn.addEventListener('click', resetApp);

tipBtns.forEach(btn => {
    btn.addEventListener('click', handleTipClick);
});

// Initial calculate just in case defaults are set
calculateTip();
