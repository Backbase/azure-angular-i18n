import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-locale-switcher',
  templateUrl: './locale-switcher.component.html',
  styleUrls: ['./locale-switcher.component.scss']
})
export class LocaleSwitcherComponent implements OnInit {
  currentLocale = this.document.cookie ? this.document.cookie.split('=')[1] : 'en';

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
  ) { }

  ngOnInit(): void {
  }

  changeLocale() {
    this.currentLocale = this.currentLocale === 'en' ? 'nl' : 'en';
    this.document.cookie = encodeURIComponent('locale') + '=' + encodeURIComponent(this.currentLocale) + ';path=/';
    this.document.location.href = this.document.location.origin;
  }

}
