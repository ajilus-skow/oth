#import <React/RCTBridgeModule.h>
#import <UserNotifications/UserNotifications.h>

@interface OTHLocalReminders : NSObject <RCTBridgeModule>
@end

@implementation OTHLocalReminders

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(schedule,
                 reminder:(NSDictionary *)reminder
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *identifier = reminder[@"id"];
  NSString *title = reminder[@"title"];
  NSString *body = reminder[@"body"];
  NSString *fireDate = reminder[@"fireDate"];
  if (![identifier isKindOfClass:NSString.class] || ![title isKindOfClass:NSString.class] || ![body isKindOfClass:NSString.class] || ![fireDate isKindOfClass:NSString.class]) {
    reject(@"invalid_reminder", @"Reminder details are invalid.", nil);
    return;
  }
  NSDate *date = [[NSISO8601DateFormatter new] dateFromString:fireDate];
  if (date == nil || [date timeIntervalSinceNow] <= 0) {
    reject(@"invalid_reminder", @"Choose a future truck visit for a reminder.", nil);
    return;
  }
  UNMutableNotificationContent *content = [UNMutableNotificationContent new];
  content.title = title;
  content.body = body;
  content.sound = UNNotificationSound.defaultSound;
  UNTimeIntervalNotificationTrigger *trigger = [UNTimeIntervalNotificationTrigger triggerWithTimeInterval:[date timeIntervalSinceNow] repeats:NO];
  UNNotificationRequest *request = [UNNotificationRequest requestWithIdentifier:identifier content:content trigger:trigger];
  [[UNUserNotificationCenter currentNotificationCenter] addNotificationRequest:request withCompletionHandler:^(NSError *error) {
    if (error != nil) reject(@"reminder_schedule_failed", @"Allow notifications in Settings to set a reminder.", error);
    else resolve(nil);
  }];
}

RCT_REMAP_METHOD(cancel,
                 identifier:(NSString *)identifier
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  [[UNUserNotificationCenter currentNotificationCenter] removePendingNotificationRequestsWithIdentifiers:@[identifier]];
  resolve(nil);
}

@end
