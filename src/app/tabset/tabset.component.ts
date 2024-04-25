import {Component, ContentChildren, QueryList} from '@angular/core';
import {TabComponent} from './tab/tab.component';

@Component({
  selector: 'app-tabset',
  templateUrl: './tabset.component.html',
  styleUrls: ['./tabset.component.css']
})
export class TabsetComponent {
  private _tabs: QueryList<TabComponent>;

  @ContentChildren(TabComponent)
  set tabs(tabs: QueryList<TabComponent>) {
    this._tabs = tabs;
    if (tabs.first && !tabs.some(tab => tab.active)) {
      this.selectTab(tabs.first);
    }
  }

  selectTab(tab: TabComponent) {
    this._tabs.forEach(t => t.active = false);
    tab.active = true;
  }

  removeTab(tab: TabComponent) {
    const index = this._tabs.toArray().indexOf(tab);
    if (index !== -1) {
      tab.removed.emit();
      this._tabs.toArray().splice(index, 1);
      if (tab.active && this._tabs.length > 0) {
        this.selectTab(this._tabs[0]);
      }
    }
  }
}
