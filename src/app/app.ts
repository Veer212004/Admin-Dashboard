import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: [],
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    // Load saved theme on app init
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      this.applyTheme(savedTheme);
    }

    // Load saved theme color
    const savedColor = localStorage.getItem('themeColor');
    if (savedColor) {
      this.applyThemeColor(savedColor);
    }
  }

  applyTheme(theme: 'light' | 'dark'): void {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }

  applyThemeColor(color: string): void {
    const colorMap: any = {
      blue: { 
        primary: '#667eea', 
        secondary: '#764ba2',
        light: '#a78bfa',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      ocean: { 
        primary: '#2E3192', 
        secondary: '#1BFFFF',
        light: '#06b6d4',
        gradient: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)'
      },
      purple: { 
        primary: '#7F00FF', 
        secondary: '#E100FF',
        light: '#c084fc',
        gradient: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)'
      },
      teal: { 
        primary: '#2C5364', 
        secondary: '#0F2027',
        light: '#14b8a6',
        gradient: 'linear-gradient(135deg, #0F2027 0%, #2C5364 100%)'
      },
      cyan: { 
        primary: '#00d2ff', 
        secondary: '#3a7bd5',
        light: '#22d3ee',
        gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)'
      },
      coral: { 
        primary: '#ff6b6b', 
        secondary: '#ee5a6f',
        light: '#fb7185',
        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
      }
    };

    const colors = colorMap[color] || colorMap.blue;
    
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--secondary-color', colors.secondary);
    document.documentElement.style.setProperty('--primary-light', colors.light);
    document.documentElement.style.setProperty('--gradient-primary', colors.gradient);
    
    const style = document.createElement('style');
    style.id = 'dynamic-theme-colors';
    const existingStyle = document.getElementById('dynamic-theme-colors');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    style.innerHTML = `
      .bg-indigo-600, .bg-purple-500, .bg-blue-600 {
        background: ${colors.gradient} !important;
      }
      .bg-indigo-500, .bg-purple-400 {
        background-color: ${colors.primary} !important;
      }
      .bg-indigo-100 {
        background-color: ${colors.light}20 !important;
      }
      .text-indigo-600, .text-purple-600 {
        color: ${colors.primary} !important;
      }
      .border-indigo-500, .border-purple-500 {
        border-color: ${colors.primary} !important;
      }
      .ring-indigo-500 {
        --tw-ring-color: ${colors.primary} !important;
      }
    `;
    
    document.head.appendChild(style);
  }
}
