// Function to handle key press validation
export function WhiteSpaceBlock(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    const input = event.target as HTMLInputElement;
    const currValue = input.value;
 
    // Safe handling of cursorPosition in case it's null
    const cursorPosition = input.selectionStart !== null ? input.selectionStart : 0;
 
    // Prevent space at the beginning or consecutive spaces
    if (charCode === 32) { // 32 is the ASCII code for space
      if (cursorPosition === 0 || currValue.charAt(cursorPosition - 1) === ' ') {
        event.preventDefault();
        return false;
      }
    }
 
    // Allow only letters (A-Z, a-z) and spaces, disallow special characters
    if (
       !(charCode >= 33 && charCode <= 64) && // Added non-alphanumeric check
      !(charCode >= 48 && charCode <= 57) &&
      !(charCode >= 65 && charCode <= 90) &&  // Uppercase letters (A-Z)
       !(charCode >= 97 && charCode <= 122) && // Lowercase letters (a-z)
      !(charCode === 32)                       // Space
    ) {
      event.preventDefault();
      return false;
    }
 
    return true; // Allow valid input
  }
 
  // Optional: You can add the @HostListener decorator if you want to use it within a class/component.
  // However, for this function, it can be directly called in your component's keypress event handler.