import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';
@Directive({
  selector: '[appPhoneMask]',
  standalone: true
})
export class PhoneMaskDirective {
    private previousValue: string = '';
  constructor(public ngControl: NgControl,
    private el: ElementRef
  ) { }


  @HostListener('input', ['$event'])
  onInputChange(event: KeyboardEvent): void {
    const input = this.el.nativeElement;
    let value = input.value.replace(/\D/g, ''); // Remove all non-numeric characters

    // Apply the mask
    if (value.length > 3 && value.length <= 6) {
      value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
    } else if (value.length > 6) {
      value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6, 10)}`;
    }

    // Update input value
    input.value = value;
    this.previousValue = value;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const input = this.el.nativeElement;
    
    // Allow backspace to properly remove characters
    if (event.key === 'Backspace') {
      let value = input.value.replace(/\D/g, '');

      if (value.length <= 3) {
        input.value = value;
      } else if (value.length <= 6) {
        input.value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
      } else {
        input.value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6, 10)}`;
      }
      this.previousValue = input.value;
    }
  }

}
