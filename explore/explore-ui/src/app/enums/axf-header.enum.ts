/**
 * AXF Header Menu Option class
 */
export class AXFHeaderMenuOption {
    constructor(public ID: string, public DISPLAY: string) {}
}

/**
 * AXF Header Menu Options
 */
// Help
export const LAUNCH_EXPLORE_FAQS_HEADER_MENU = new AXFHeaderMenuOption('LAUNCH_EXPLORE_FAQS', 'Explore FAQs');
export const LAUNCH_ABOUT_EXPLORE_HEADER_MENU = new AXFHeaderMenuOption('LAUNCH_ABOUT_EXPLORE', 'About Explore');
export const SEMANTIC_SEARCH_EXPLORE_HEADER_MENU = new AXFHeaderMenuOption('SEMANTIC_SEARCH_EXPLORE', 'Semantic Search (In Testing)');
