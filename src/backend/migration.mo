import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Old types without SalonStatus and BookingStatus enums
  type OldSalon = {
    id : Nat;
    staffName : Text;
    salonName : Text;
    address : Text;
    mobile : Text;
    registeredAt : Int;
  };

  type OldBooking = {
    id : Nat;
    salonId : Nat;
    customerName : Text;
    customerMobile : Text;
    service : Text;
    timeSlot : Text;
    status : Text;
    createdAt : Int;
  };

  type OldUserProfile = {
    name : Text;
    salonId : ?Nat;
  };

  type OldActor = {
    salons : Map.Map<Nat, OldSalon>;
    bookings : Map.Map<Nat, OldBooking>;
    salonOwners : Map.Map<Nat, Principal>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    nextSalonId : Nat;
    nextBookingId : Nat;
  };

  public func run(old : OldActor) : { salons : Map.Map<Nat, NewSalon>; bookings : Map.Map<Nat, NewBooking>; salonOwners : Map.Map<Nat, Principal>; userProfiles : Map.Map<Principal, NewUserProfile>; nextSalonId : Nat; nextBookingId : Nat } {
    let newSalons = old.salons.map<Nat, OldSalon, NewSalon>(
      func(_id, oldSalon) {
        {
          id = oldSalon.id;
          staffName = oldSalon.staffName;
          salonName = oldSalon.salonName;
          address = oldSalon.address;
          mobile = oldSalon.mobile;
          registeredAt = oldSalon.registeredAt;
          status = #approved;
        };
      }
    );

    let newBookings = old.bookings.map<Nat, OldBooking, NewBooking>(
      func(_id, oldBooking) {
        {
          id = oldBooking.id;
          salonId = oldBooking.salonId;
          customerName = oldBooking.customerName;
          customerMobile = oldBooking.customerMobile;
          service = oldBooking.service;
          timeSlot = oldBooking.timeSlot;
          status = #pending;
          createdAt = oldBooking.createdAt;
        };
      }
    );

    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          name = oldProfile.name;
          salonId = oldProfile.salonId;
        };
      }
    );

    {
      salons = newSalons;
      bookings = newBookings;
      salonOwners = old.salonOwners;
      userProfiles = newUserProfiles;
      nextSalonId = old.nextSalonId;
      nextBookingId = old.nextBookingId;
    };
  };

  // New types with SalonStatus and BookingStatus enums
  type NewSalon = {
    id : Nat;
    staffName : Text;
    salonName : Text;
    address : Text;
    mobile : Text;
    registeredAt : Int;
    status : { #pending; #approved; #rejected };
  };

  type NewBooking = {
    id : Nat;
    salonId : Nat;
    customerName : Text;
    customerMobile : Text;
    service : Text;
    timeSlot : Text;
    status : { #pending; #completed; #cancelled };
    createdAt : Int;
  };

  type NewUserProfile = {
    name : Text;
    salonId : ?Nat;
  };
};
