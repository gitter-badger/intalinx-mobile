
import {
    Component,
    ComponentFactoryResolver,
    Directive,
    ViewContainerRef,
    Input,
    Injector,
    ApplicationRef
} from '@angular/core';
import {
    DomSanitizer,
    SafeHtml
} from '@angular/platform-browser';

/**
  This component render an HTML code with inner directives on it.
  The @Input innerContent receives an array argument, the first array element
  is the code to be parsed. The second index is an array of Components that
  contains the directives present in the code.

  Example:

  <div [innerContent]="[
    'Go to <a [routerLink]="[Home]">Home page</a>',
    [RouterLink]
  ]">
**/
@Component({
    selector: 'dynamic-content',
    template: `
        <div>{{htmlContent}}</div>
    `
})
export class DynamicContent {
    // @Input()
    // set innerContent(content) {
    //     if (content) {
    //         this.renderTemplate(
    //             content[0],
    //             content[1]
    //         );
    //     }
    // }
    @Input() innerContent;
    htmlContent: SafeHtml;
    constructor(
        private elementRef: ViewContainerRef,
        public domSanitizer: DomSanitizer) {
            this.htmlContent = this.domSanitizer.bypassSecurityTrustHtml(this.innerContent);
            
        }

    // public renderTemplate(template, directives) {
    //     let dynamicComponent = this.toComponent(template, directives);
    //     this.elementRef.createComponent(this.resolver.resolveComponentFactory(dynamicComponent));
    //     // this.resolver.resolveComponent(
    //     //     dynamicComponent
    //     // ).then(factory => {
    //     //     this.elementRef.createComponent(factory);
    //     // });
    // }

    // private toComponent(template, directives = []) {
    //     @Component({
    //         selector: 'dynamic-content',
    //         template: template
    //         // ,
    //         // directives: directives
    //     })
    //     class DynamicComponent {}
    //     return DynamicComponent;
    // }
}