import * as cheerio from 'cheerio';
import { SourceAdapter, RawEvent } from "./interface";

export class GenericWebAdapter implements SourceAdapter {
  public name = "generic-web";

  // In a real app, this would come from a config file or database
  private cityUrlMap: Record<string, string[]> = {
    "San Francisco": ["http://example.com/sf-events"],
    "New York": ["http://example.com/ny-events"],
  };

  async fetchCity(city: string): Promise<RawEvent[]> {
    const urls = this.cityUrlMap[city] || [];
    if (urls.length === 0) return [];

    const allEvents: RawEvent[] = [];

    for (const url of urls) {
      // TODO: Implement robots.txt check before fetching
      console.log(`[GenericWebAdapter] Scraping ${url}`);

      // For this example, we'll use mock HTML instead of a real fetch
      const html = this.getMockHtml();
      const $ = cheerio.load(html);

      const events: RawEvent[] = [];
      $('.event-card').each((_i, el) => {
        const title = $(el).find('h2').text().trim();
        const date = $(el).find('.date').text().trim();
        const description = $(el).find('p').text().trim();
        const eventUrl = $(el).find('a').attr('href') || url;

        if (title && date) {
          events.push({
            title,
            startsAt: new Date(date),
            description,
            url: eventUrl,
            source: this.name,
            rawCategory: "Community",
            city: city,
          });
        }
      });
      allEvents.push(...events);
    }

    return allEvents;
  }

  private getMockHtml(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head><title>City Events</title></head>
        <body>
          <h1>Upcoming Events</h1>
          <div id="events-list">
            <div class="event-card">
              <h2>Community Garden Day</h2>
              <p class="date">2025-09-15T10:00:00Z</p>
              <p>Join us for a day of planting and fun!</p>
              <a href="http://example.com/event/1">Details</a>
            </div>
            <div class="event-card">
              <h2>Open Mic Night</h2>
              <p class="date">2025-09-20T19:00:00Z</p>
              <p>Share your talent with the community.</p>
              <a href="http://example.com/event/2">Details</a>
            </div>
            <div class="event-card">
              <h2>Local History Tour</h2>
              <p class="date">2025-09-22T14:00:00Z</p>
              <p>Explore the hidden history of our city.</p>
              <a href="http://example.com/event/3">Details</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
