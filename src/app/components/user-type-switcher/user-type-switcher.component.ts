import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-type-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="switcher-container">
      <label>User Type (Demo):</label>
      <button 
        [class.active]="currentType === 'medical'" 
        (click)="switchType('medical')"
        class="type-btn">
        Medical Student
      </button>
      <button 
        [class.active]="currentType === 'vet'" 
        (click)="switchType('vet')"
        class="type-btn">
        Veterinary Student
      </button>
    </div>
  `,
  styles: [`
    .switcher-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
    }
    
    label {
      color: white;
      font-weight: 600;
    }
    
    .type-btn {
      padding: 0.5rem 1rem;
      border: 2px solid white;
      background: transparent;
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .type-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .type-btn.active {
      background: white;
      color: #667eea;
    }
  `]
})
export class UserTypeSwitcherComponent {
  currentType: 'medical' | 'vet' = 'medical';

  constructor(private router: Router) {
    this.currentType = localStorage.getItem('userType') as any || 'medical';
  }

  switchType(type: 'medical' | 'vet') {
    this.currentType = type;
    localStorage.setItem('userType', type);
    // Reload current route
    this.router.navigate([this.router.url.split('?')[0]]);
  }
}
