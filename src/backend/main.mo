import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Include authorization with role-based access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type SalonStatus = { #pending; #approved; #rejected };
  public type BookingStatus = { #pending; #completed; #cancelled };

  public type Salon = {
    id : Nat;
    staffName : Text;
    salonName : Text;
    address : Text;
    mobile : Text;
    registeredAt : Int;
    status : SalonStatus;
  };

  public type Booking = {
    id : Nat;
    salonId : Nat;
    customerName : Text;
    customerMobile : Text;
    service : Text;
    timeSlot : Text;
    status : BookingStatus;
    createdAt : Int;
  };

  public type SalonLoginInfo = {
    id : Nat;
    staffName : Text;
    salonName : Text;
    address : Text;
    mobile : Text;
  };

  public type SalonListItem = {
    id : Nat;
    salonName : Text;
    address : Text;
  };

  public type BookingResponse = {
    success : Bool;
    bookingId : Nat;
    message : Text;
  };

  public type UserProfile = {
    name : Text;
    salonId : ?Nat;
  };

  let salons = Map.empty<Nat, Salon>();
  let bookings = Map.empty<Nat, Booking>();
  let salonOwners = Map.empty<Nat, Principal>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextSalonId = 1;
  var nextBookingId = 1;

  module Booking {
    public func compareByCreatedAt(b1 : Booking, b2 : Booking) : Order.Order {
      Nat.compare(b2.createdAt.toNat(), b1.createdAt.toNat());
    };
  };

  func getCurrentTime() : Int {
    Time.now();
  };

  func generateTimeSlots() : [Text] {
    let slots = List.empty<Text>();
    var hour = 8;
    while (hour <= 18) {
      var minute = 0;
      while (minute < 60) {
        let hourText = if (hour > 9) { hour.toText() } else { "0" # hour.toText() };
        let minuteText = if (minute == 0) { "00" } else if (minute == 10) {
          "10";
        } else if (minute == 20) { "20" } else if (minute == 30) { "30" } else if (minute == 40) {
          "40";
        } else {
          "50";
        };
        slots.add(hourText # ":" # minuteText);
        minute += 10;
      };
      hour += 1;
    };
    slots.toArray();
  };

  func isTimeSlotAvailable(salonId : Nat, date : Text, timeSlot : Text, service : Text) : Bool {
    for (booking in bookings.values()) {
      if (
        booking.salonId == salonId and booking.timeSlot.startsWith(#text(date)) and (booking.status == #pending or booking.status == #completed)
      ) {
        if (service == "Hair Cut + Beard") {
          let timeParts = timeSlot.split(#text(" ")).toArray();
          if (timeParts.size() == 2) {
            switch (Nat.fromText(timeParts[1])) {
              case (?slotIndex) {
                if (
                  booking.timeSlot == timeSlot
                  or (slotIndex + 1 < 60 and booking.timeSlot == (slotIndex + 1).toText())
                ) {
                  return false;
                };
              };
              case (null) { () };
            };
          };
        } else if (booking.timeSlot == timeSlot) {
          return false;
        };
      };
    };
    true;
  };

  func isSalonOwner(caller : Principal, salonId : Nat) : Bool {
    switch (salonOwners.get(salonId)) {
      case (?owner) { Principal.equal(owner, caller) };
      case (null) { false };
    };
  };

  // SALON MANAGEMENT

  /// Register a new Salon
  public shared ({ caller }) func registerSalon(
    mobile : Text,
    staffName : Text,
    salonName : Text,
    address : Text,
  ) : async Nat {
    let existing = salons.values().find(
      func(s) { s.mobile == mobile }
    );
    switch (existing) {
      case (?salon) { salon.id };
      case (null) {
        let id = nextSalonId;
        nextSalonId += 1;
        let salon : Salon = {
          id;
          staffName;
          salonName;
          address;
          mobile;
          registeredAt = getCurrentTime();
          status = #pending;
        };
        salons.add(id, salon);
        salonOwners.add(id, caller);
        id;
      };
    };
  };

  /// Login Salon (only if approved)
  public query ({ caller }) func loginSalon(mobile : Text) : async ?SalonLoginInfo {
    switch (salons.values().find(func(s) { s.mobile == mobile and s.status == #approved })) {
      case (?salon) {
        ?{
          id = salon.id;
          staffName = salon.staffName;
          salonName = salon.salonName;
          address = salon.address;
          mobile = salon.mobile;
        };
      };
      case (null) { null };
    };
  };

  /// Admin: Get all salons (admin only)
  public query ({ caller }) func getSalons() : async [Salon] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    salons.values().toArray();
  };

  /// Get approved salons (public)
  public query ({ caller }) func getApprovedSalons() : async [SalonListItem] {
    salons.values().toArray().filter(
      func(s) { s.status == #approved }
    ).map(
      func(s) {
        {
          id = s.id;
          salonName = s.salonName;
          address = s.address;
        };
      }
    );
  };

  /// Admin: Get pending salons (admin only)
  public query ({ caller }) func getPendingSalons() : async [Salon] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    salons.values().toArray().filter(
      func(s) { s.status == #pending }
    );
  };

  /// Admin: Approve salon (admin only)
  public shared ({ caller }) func approveSalon(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (salons.get(id)) {
      case (?salon) {
        let updatedSalon : Salon = {
          id = salon.id;
          staffName = salon.staffName;
          salonName = salon.salonName;
          address = salon.address;
          mobile = salon.mobile;
          registeredAt = salon.registeredAt;
          status = #approved;
        };
        salons.add(id, updatedSalon);
        true;
      };
      case (null) { false };
    };
  };

  /// Admin: Reject salon (admin only)
  public shared ({ caller }) func rejectSalon(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (salons.get(id)) {
      case (?salon) {
        let updatedSalon : Salon = {
          id = salon.id;
          staffName = salon.staffName;
          salonName = salon.salonName;
          address = salon.address;
          mobile = salon.mobile;
          registeredAt = salon.registeredAt;
          status = #rejected;
        };
        salons.add(id, updatedSalon);
        true;
      };
      case (null) { false };
    };
  };

  // BOOKING MANAGEMENT

  /// Get available time slots for a salon on a specific date
  public query ({ caller }) func getAvailableSlots(salonId : Nat, date : Text) : async [Text] {
    let allSlots = generateTimeSlots();
    let availableSlots = List.empty<Text>();

    for (slot in allSlots.values()) {
      let isBooked = bookings.values().toArray().any(
        func(booking) {
          booking.salonId == salonId
          and booking.timeSlot.startsWith(#text(date))
          and (booking.status == #pending or booking.status == #completed)
          and booking.timeSlot == slot
        }
      );
      if (not isBooked) {
        availableSlots.add(slot);
      };
    };
    availableSlots.toArray();
  };

  /// Create a new booking
  public shared ({ caller }) func createBooking(
    salonId : Nat,
    customerName : Text,
    customerMobile : Text,
    service : Text,
    timeSlot : Text,
    date : Text,
  ) : async BookingResponse {
    let slots = List.empty<Text>();

    if (not isTimeSlotAvailable(salonId, date, timeSlot, service)) {
      return {
        success = false;
        bookingId = 0;
        message = "Time slot already booked";
      };
    };

    switch (salons.get(salonId)) {
      case (?salon) {
        if (salon.status != #approved) {
          return {
            success = false;
            bookingId = 0;
            message = "Salon is not approved";
          };
        };
      };
      case (null) {
        return {
          success = false;
          bookingId = 0;
          message = "Salon does not exist";
        };
      };
    };

    let id = nextBookingId;
    nextBookingId += 1;

    let booking : Booking = {
      id;
      salonId;
      customerName;
      customerMobile;
      service;
      timeSlot = date # " " # timeSlot;
      status = #pending;
      createdAt = getCurrentTime();
    };

    bookings.add(id, booking);

    {
      success = true;
      bookingId = id;
      message = "Booking successful";
    };
  };

  /// Get all bookings for a salon (ordered by creation time)
  public query ({ caller }) func getBookingsBySalon(salonId : Nat) : async [Booking] {
    if (not isSalonOwner(caller, salonId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only salon owner or admin can view bookings");
    };
    bookings.values().toArray().filter(
      func(booking) { booking.salonId == salonId }
    ).sort(
      Booking.compareByCreatedAt
    );
  };

  /// Update booking status
  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, status : BookingStatus) : async Bool {
    switch (bookings.get(bookingId)) {
      case (?booking) {
        if (not isSalonOwner(caller, booking.salonId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only salon owner or admin can update booking status");
        };
        let updatedBooking : Booking = {
          id = booking.id;
          salonId = booking.salonId;
          customerName = booking.customerName;
          customerMobile = booking.customerMobile;
          service = booking.service;
          timeSlot = booking.timeSlot;
          status;
          createdAt = booking.createdAt;
        };
        bookings.add(bookingId, updatedBooking);
        true;
      };
      case (null) { false };
    };
  };

  // USER PROFILE MANAGEMENT

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
