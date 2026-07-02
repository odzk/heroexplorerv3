import { trigger, animate, transition, style } from '@angular/animations';

export function fadeInAnimation() {
  return trigger('fadeInAnimation', [
    transition(':enter', [
      style({ transform: 'translateX(400%)' }),
      animate('.5s ease-in-out', style({ transform: 'translateX(0%)' }))
    ]),
    // transition(':leave', [
    //     style({ transform: 'translateX(0%)' }),
    //     animate('.5s ease-in-out', style({ transform: 'translateX(400%)' }))
    // ])
  ]);
};

export function  fadeOutAnimation() {
  return trigger('fadeOutAnimation', [
    transition(':enter', [
      style({ transform: 'translateY(100%)' }),
      animate('.5s ease-in-out', style({ transform: 'translateY(0%)' }))
    ]),
    transition(':leave', [
      style({ transform: 'translateY(0%)' }),
      animate('.5s ease-in-out', style({ transform: 'translateY(100%)' }))
    ])
  ]);
};
