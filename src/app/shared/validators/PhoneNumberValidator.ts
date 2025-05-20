// Function to handle phone number validation
export function PhoneNumberBlock(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;

    // Allow only numeric characters (0-9) and prevent other characters
    if (charCode < 48 || charCode > 57) { // 48 is '0' and 57 is '9'
        event.preventDefault(); // Prevent input of non-numeric characters
        return false;
    }

    return true; // Allow valid input
}
