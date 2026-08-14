#import <EventKit/EventKit.h>
#import <React/RCTBridgeModule.h>

@interface OTHCalendar : NSObject <RCTBridgeModule>
@end

@implementation OTHCalendar

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(addEvent,
                 event:(NSDictionary *)event
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *title = event[@"title"];
  NSString *startDate = event[@"startDate"];
  NSString *endDate = event[@"endDate"];
  if (![title isKindOfClass:NSString.class] || ![startDate isKindOfClass:NSString.class] || ![endDate isKindOfClass:NSString.class]) {
    reject(@"invalid_event", @"Calendar event details are invalid.", nil);
    return;
  }

  NSISO8601DateFormatter *formatter = [NSISO8601DateFormatter new];
  NSDate *start = [formatter dateFromString:startDate];
  NSDate *end = [formatter dateFromString:endDate];
  if (start == nil || end == nil || [end compare:start] != NSOrderedDescending) {
    reject(@"invalid_event", @"Calendar event times are invalid.", nil);
    return;
  }

  EKEventStore *store = [EKEventStore new];
  void (^saveEvent)(BOOL, NSError *) = ^(BOOL granted, NSError *error) {
    if (!granted || error != nil) {
      reject(@"calendar_access_denied", @"Allow calendar access in Settings to add this visit.", error);
      return;
    }
    EKEvent *calendarEvent = [EKEvent eventWithEventStore:store];
    calendarEvent.title = title;
    calendarEvent.startDate = start;
    calendarEvent.endDate = end;
    calendarEvent.calendar = store.defaultCalendarForNewEvents;
    calendarEvent.location = [event[@"location"] isKindOfClass:NSString.class] ? event[@"location"] : nil;
    calendarEvent.notes = [event[@"notes"] isKindOfClass:NSString.class] ? event[@"notes"] : nil;
    NSError *saveError = nil;
    if (![store saveEvent:calendarEvent span:EKSpanThisEvent commit:YES error:&saveError]) {
      reject(@"calendar_save_failed", @"We couldn’t add this visit to your calendar.", saveError);
      return;
    }
    resolve(nil);
  };

  if (@available(iOS 17.0, *)) {
    [store requestWriteOnlyAccessToEventsWithCompletion:saveEvent];
  } else {
    [store requestAccessToEntityType:EKEntityTypeEvent completion:saveEvent];
  }
}

@end
