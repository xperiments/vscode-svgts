import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class KeyboardService {
  public cmdDown = false;

  constructor() {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      this.cmdDown = event.which === 91;
    });

    document.addEventListener("keyup", (event: KeyboardEvent) => {
      this.cmdDown = false;
    });

    window.addEventListener("blur", (event: KeyboardEvent) => {
      this.cmdDown = false;
    });
  }
}
