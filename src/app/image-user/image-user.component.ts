import { Component, Input } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-image-user',
  templateUrl: './image-user.component.html',
  styleUrls: ['./image-user.component.scss']
})
export class ImageUserComponent {
  @Input() modelAttrName: string;
  @Input() modelAttrSurname: string;
  @Input() modelAttrImage: string;
  @Input() model: any;
  @Input() photoURL: string | null = null;

  initials: string | undefined;

  constructor(private authService: AuthService) {
    this.modelAttrName = '';
    this.modelAttrSurname = '';
    this.modelAttrImage = '';

  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.authService.userData) {

        const userData = this.authService.userData;
        const providerData = userData.providerData[0];
        const name = providerData.displayName || '';

        this.initials = this.getInitials(name);
      }
    }, 2000);
  }
  public getInitials(displayName: string): string {
    let initials = '';
    if (displayName) {
      const nameParts = displayName.split(' ');
      for (const part of nameParts) {
        initials += part.substring(0, 1);
      }
    }
    return initials;
  }



}
