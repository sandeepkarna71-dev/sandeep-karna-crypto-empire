import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Char "mo:core/Char";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type VlogCategory = {
    #vlog;
    #promo;
    #trading;
  };

  module VlogCategory {
    public func toText(category : VlogCategory) : Text {
      switch (category) {
        case (#vlog) { "vlog" };
        case (#promo) { "promo" };
        case (#trading) { "trading" };
      };
    };
  };

  public type VlogPost = {
    id : Nat;
    title : Text;
    description : Text;
    videoUrl : Text;
    thumbnailUrl : Text;
    createdAt : Int;
    category : VlogCategory;
  };

  module VlogPost {
    public func compare(a : VlogPost, b : VlogPost) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  public type Announcement = {
    id : Nat;
    title : Text;
    content : Text;
    createdAt : Int;
  };

  module Announcement {
    public func compare(a : Announcement, b : Announcement) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  public type Ad = {
    id : Nat;
    title : Text;
    description : Text;
    imageUrl : Text;
    linkUrl : Text;
    isActive : Bool;
    createdAt : Int;
  };

  module Ad {
    public func compare(a : Ad, b : Ad) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  public type UserAccount = {
    username : Text;
    passwordHash : Blob;
    balance : Nat;
    totalEarned : Nat;
    totalDeposited : Nat;
  };

  // Extended user registration data (stored separately to avoid upgrade issues)
  public type UserRegistrationData = {
    principalId : Text;
    username : Text;
    email : Text;
    fullName : Text;
    joinDate : Int;
    referralCode : Text;
    referredBy : ?Text;
  };

  // Combined user info for admin
  public type UserInfo = {
    principalId : Text;
    username : Text;
    email : Text;
    fullName : Text;
    joinDate : Int;
    referralCode : Text;
    referredBy : ?Text;
    balance : Nat;
    totalEarned : Nat;
    totalDeposited : Nat;
  };

  public type DepositRequest = {
    id : Nat;
    userId : Principal;
    username : Text;
    currency : Text;
    amount : Text;
    txHash : Text;
    status : { #pending; #approved; #rejected };
    createdAt : Int;
    reviewedAt : Int;
  };

  public type WithdrawalRequest = {
    id : Nat;
    userId : Principal;
    username : Text;
    amount : Nat;
    currency : Text;
    walletAddress : Text;
    status : { #pending; #approved; #rejected };
    createdAt : Int;
    reviewedAt : Int;
  };

  public type EarnRecord = {
    id : Nat;
    userId : Principal;
    username : Text;
    taskType : { #watchVideo; #writeArticle };
    contentId : Text;
    amount : Nat;
    status : { #pending; #approved; #rejected };
    createdAt : Int;
  };

  public type AdminDashboardStats = {
    totalUsers : Nat;
    totalPendingDeposits : Nat;
    totalPendingWithdrawals : Nat;
    totalPendingEarnRecords : Nat;
    totalPlatformBalance : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // Persistent State
  var nextVlogId = 1;
  var nextAnnouncementId = 1;
  var nextAdId = 1;
  var nextDepositId = 1;
  var nextWithdrawalId = 1;
  var nextEarnId = 1;

  let vlogPosts = Map.empty<Nat, VlogPost>();
  let announcements = Map.empty<Nat, Announcement>();
  let ads = Map.empty<Nat, Ad>();

  let userAccounts = Map.empty<Principal, UserAccount>();
  let userRegistrationData = Map.empty<Principal, UserRegistrationData>();
  let depositRequests = Map.empty<Nat, DepositRequest>();
  let withdrawalRequests = Map.empty<Nat, WithdrawalRequest>();
  let earnRecords = Map.empty<Nat, EarnRecord>();

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Anonymous user storage (cross-device, no II needed)
  let usernameUsers = Map.empty<Text, UserRegistrationData>();
  let usernameBalances = Map.empty<Text, Nat>();

  // Authorization System
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  //----------------- User Profile Functions -----------------//

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
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

  //----------------- Vlogs CRUD -----------------//

  public shared ({ caller }) func createVlogPost(
    title : Text,
    description : Text,
    videoUrl : Text,
    thumbnailUrl : Text,
    category : VlogCategory,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create vlogs");
    };

    let vlogPost : VlogPost = {
      id = nextVlogId;
      title;
      description;
      videoUrl;
      thumbnailUrl;
      createdAt = Time.now();
      category;
    };

    vlogPosts.add(nextVlogId, vlogPost);
    nextVlogId += 1;
  };

  public shared ({ caller }) func updateVlogPost(
    id : Nat,
    title : Text,
    description : Text,
    videoUrl : Text,
    thumbnailUrl : Text,
    category : VlogCategory,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update vlogs");
    };

    switch (vlogPosts.get(id)) {
      case (null) { Runtime.trap("Vlog post not found") };
      case (?existing) {
        let updated : VlogPost = {
          id;
          title;
          description;
          videoUrl;
          thumbnailUrl;
          createdAt = existing.createdAt;
          category;
        };
        vlogPosts.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteVlogPost(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete vlogs");
    };

    if (not vlogPosts.containsKey(id)) {
      Runtime.trap("Vlog post not found");
    };

    vlogPosts.remove(id);
  };

  public query func getVlogPosts() : async [VlogPost] {
    vlogPosts.values().toArray().sort();
  };

  public query func getVlogPost(id : Nat) : async VlogPost {
    switch (vlogPosts.get(id)) {
      case (null) { Runtime.trap("Vlog post not found") };
      case (?post) { post };
    };
  };

  public query func getVlogPostsByCategory(category : VlogCategory) : async [VlogPost] {
    vlogPosts.values().toArray().filter(
      func(post) { post.category == category }
    ).sort();
  };

  //----------------- Announcements CRUD -----------------//

  public shared ({ caller }) func createAnnouncement(
    title : Text,
    content : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create announcements");
    };

    let announcement : Announcement = {
      id = nextAnnouncementId;
      title;
      content;
      createdAt = Time.now();
    };

    announcements.add(nextAnnouncementId, announcement);
    nextAnnouncementId += 1;
  };

  public shared ({ caller }) func updateAnnouncement(
    id : Nat,
    title : Text,
    content : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update announcements");
    };

    switch (announcements.get(id)) {
      case (null) { Runtime.trap("Announcement not found") };
      case (?existing) {
        let updated : Announcement = {
          id;
          title;
          content;
          createdAt = existing.createdAt;
        };
        announcements.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteAnnouncement(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete announcements");
    };

    if (not announcements.containsKey(id)) {
      Runtime.trap("Announcement not found");
    };

    announcements.remove(id);
  };

  public query func getAnnouncements() : async [Announcement] {
    announcements.values().toArray().sort();
  };

  public query func getAnnouncement(id : Nat) : async Announcement {
    switch (announcements.get(id)) {
      case (null) { Runtime.trap("Announcement not found") };
      case (?a) { a };
    };
  };

  //----------------- Ads/Promotions CRUD -----------------//

  public shared ({ caller }) func createAd(
    title : Text,
    description : Text,
    imageUrl : Text,
    linkUrl : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create ads");
    };

    let ad : Ad = {
      id = nextAdId;
      title;
      description;
      imageUrl;
      linkUrl;
      isActive = true;
      createdAt = Time.now();
    };

    ads.add(nextAdId, ad);
    nextAdId += 1;
  };

  public shared ({ caller }) func updateAd(
    id : Nat,
    title : Text,
    description : Text,
    imageUrl : Text,
    linkUrl : Text,
    isActive : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update ads");
    };

    switch (ads.get(id)) {
      case (null) { Runtime.trap("Ad not found") };
      case (?existing) {
        let updated : Ad = {
          id;
          title;
          description;
          imageUrl;
          linkUrl;
          isActive;
          createdAt = existing.createdAt;
        };
        ads.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteAd(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete ads");
    };

    if (not ads.containsKey(id)) {
      Runtime.trap("Ad not found");
    };

    ads.remove(id);
  };

  public query func getActiveAds() : async [Ad] {
    ads.values().toArray().filter(
      func(ad) { ad.isActive }
    ).sort();
  };

  //----------------- User Account Registration -----------------//

  // Extended registration: stores full user info in canister (shared across all devices)
  public shared ({ caller }) func registerUserFull(
    username : Text,
    passwordHash : Blob,
    email : Text,
    fullName : Text,
    referralCode : Text,
    referredBy : ?Text,
  ) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot register");
    };

    switch (userAccounts.get(caller)) {
      case (?_) { Runtime.trap("Account already exists for this principal") };
      case (null) {
        let usernameTaken = userAccounts.values().toArray().any(
          func(account) { account.username.toLower() == username.toLower() }
        );
        if (usernameTaken) {
          Runtime.trap("Username already taken");
        };
        let emailTaken = userRegistrationData.values().toArray().any(
          func(d) { d.email.toLower() == email.toLower() }
        );
        if (emailTaken) {
          Runtime.trap("Email already registered");
        };

        let account : UserAccount = {
          username;
          passwordHash;
          balance = 0;
          totalEarned = 0;
          totalDeposited = 0;
        };
        userAccounts.add(caller, account);

        let regData : UserRegistrationData = {
          principalId = caller.toText();
          username;
          email;
          fullName;
          joinDate = Time.now();
          referralCode;
          referredBy;
        };
        userRegistrationData.add(caller, regData);

        // Assign user role
        accessControlState.userRoles.add(caller, #user);

        // Give referral bonus to referrer ($1 = 1 unit)
        switch (referredBy) {
          case (null) {};
          case (?refCode) {
            let referrerEntry = userRegistrationData.values().toArray().find(
              func(d) { d.referralCode == refCode }
            );
            switch (referrerEntry) {
              case (null) {};
              case (?rd) {
                let referrerPrincipal = Principal.fromText(rd.principalId);
                switch (userAccounts.get(referrerPrincipal)) {
                  case (null) {};
                  case (?refAccount) {
                    let updated : UserAccount = {
                      refAccount with
                      balance = refAccount.balance + 1;
                      totalEarned = refAccount.totalEarned + 1;
                    };
                    userAccounts.add(referrerPrincipal, updated);
                  };
                };
              };
            };
          };
        };
      };
    };
  };

  // Legacy registration (kept for backward compatibility)
  public shared ({ caller }) func registerUser(username : Text, passwordHash : Blob) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot register");
    };

    switch (userAccounts.get(caller)) {
      case (?_) { Runtime.trap("Account already exists for this principal") };
      case (null) {
        let usernameTaken = userAccounts.values().toArray().any(
          func(account) { account.username == username }
        );
        if (usernameTaken) {
          Runtime.trap("Username already taken");
        };
        let account : UserAccount = {
          username;
          passwordHash;
          balance = 0;
          totalEarned = 0;
          totalDeposited = 0;
        };
        userAccounts.add(caller, account);
        accessControlState.userRoles.add(caller, #user);
      };
    };
  };

  // Login: find user by username or email, verify passwordHash
  public query func loginUser(usernameOrEmail : Text, passwordHash : Blob) : async ?UserInfo {
    // Find by username first
    let byUsername = userRegistrationData.values().toArray().find(
      func(d) { d.username.toLower() == usernameOrEmail.toLower() }
    );
    let byEmail = userRegistrationData.values().toArray().find(
      func(d) { d.email.toLower() == usernameOrEmail.toLower() }
    );
    let regData = switch (byUsername) {
      case (?d) { ?d };
      case (null) { byEmail };
    };
    switch (regData) {
      case (null) { null };
      case (?rd) {
        let principal = Principal.fromText(rd.principalId);
        switch (userAccounts.get(principal)) {
          case (null) { null };
          case (?account) {
            if (account.passwordHash != passwordHash) {
              null
            } else {
              ?{
                principalId = rd.principalId;
                username = rd.username;
                email = rd.email;
                fullName = rd.fullName;
                joinDate = rd.joinDate;
                referralCode = rd.referralCode;
                referredBy = rd.referredBy;
                balance = account.balance;
                totalEarned = account.totalEarned;
                totalDeposited = account.totalDeposited;
              }
            }
          };
        };
      };
    };
  };

  // Get all users for admin dashboard
  public query ({ caller }) func getAllUsers() : async [UserInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userRegistrationData.values().toArray().map(
      func(rd) {
        let principal = Principal.fromText(rd.principalId);
        let (bal, earned, deposited) = switch (userAccounts.get(principal)) {
          case (null) { (0, 0, 0) };
          case (?acc) { (acc.balance, acc.totalEarned, acc.totalDeposited) };
        };
        {
          principalId = rd.principalId;
          username = rd.username;
          email = rd.email;
          fullName = rd.fullName;
          joinDate = rd.joinDate;
          referralCode = rd.referralCode;
          referredBy = rd.referredBy;
          balance = bal;
          totalEarned = earned;
          totalDeposited = deposited;
        }
      }
    );
  };

  // Get current user's full info
  public query ({ caller }) func getMyUserInfo() : async ?UserInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their own info");
    };
    switch (userRegistrationData.get(caller)) {
      case (null) { null };
      case (?rd) {
        switch (userAccounts.get(caller)) {
          case (null) { null };
          case (?acc) {
            ?{
              principalId = rd.principalId;
              username = rd.username;
              email = rd.email;
              fullName = rd.fullName;
              joinDate = rd.joinDate;
              referralCode = rd.referralCode;
              referredBy = rd.referredBy;
              balance = acc.balance;
              totalEarned = acc.totalEarned;
              totalDeposited = acc.totalDeposited;
            }
          };
        };
      };
    };
  };

  // Admin: update user balance manually
  public shared ({ caller }) func adminUpdateUserBalance(principalId : Text, newBalance : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update balances");
    };
    let target = Principal.fromText(principalId);
    switch (userAccounts.get(target)) {
      case (null) { Runtime.trap("User not found") };
      case (?account) {
        let updated : UserAccount = { account with balance = newBalance };
        userAccounts.add(target, updated);
      };
    };
  };

  public query ({ caller }) func getUserAccount() : async ?UserAccount {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view account data");
    };
    userAccounts.get(caller);
  };

  //----------------- Deposit System -----------------//

  public shared ({ caller }) func submitDepositRequest(
    username : Text,
    currency : Text,
    amount : Text,
    txHash : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit deposit requests");
    };

    switch (userAccounts.get(caller)) {
      case (null) { Runtime.trap("User account not found") };
      case (?account) {
        if (account.username != username) {
          Runtime.trap("Username does not match caller's account");
        };

        let request : DepositRequest = {
          id = nextDepositId;
          userId = caller;
          username;
          currency;
          amount;
          txHash;
          status = #pending;
          createdAt = Time.now();
          reviewedAt = 0;
        };

        depositRequests.add(nextDepositId, request);
        nextDepositId += 1;
      };
    };
  };

  public query ({ caller }) func getUserDeposits() : async [DepositRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view deposit history");
    };

    switch (userAccounts.get(caller)) {
      case (null) { Runtime.trap("User account not found") };
      case (?_) {
        depositRequests.values().toArray().filter(
          func(r) { r.userId == caller }
        );
      };
    };
  };

  public query ({ caller }) func getPendingDeposits() : async [DepositRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get pending deposits");
    };

    depositRequests.values().toArray().filter(
      func(r) { r.status == #pending }
    );
  };

  public query ({ caller }) func getAllDeposits() : async [DepositRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all deposits");
    };
    depositRequests.values().toArray();
  };

  public shared ({ caller }) func approveDeposit(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve deposits");
    };

    switch (depositRequests.get(id)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?request) {
        if (request.status != #pending) {
          Runtime.trap("Deposit request already processed");
        };

        let amountNat = switch (Nat.fromText(request.amount)) {
          case (null) { Runtime.trap("Invalid amount format") };
          case (?n) { n };
        };

        let updated : DepositRequest = {
          request with
          status = #approved;
          reviewedAt = Time.now();
        };
        depositRequests.add(id, updated);

        switch (userAccounts.get(request.userId)) {
          case (null) { Runtime.trap("User account not found") };
          case (?account) {
            let updatedAccount : UserAccount = {
              account with
              balance = account.balance + amountNat;
              totalDeposited = account.totalDeposited + amountNat;
            };
            userAccounts.add(request.userId, updatedAccount);
          };
        };
      };
    };
  };

  public shared ({ caller }) func rejectDeposit(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject deposits");
    };

    switch (depositRequests.get(id)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?request) {
        if (request.status != #pending) {
          Runtime.trap("Deposit request already processed");
        };
        let updated : DepositRequest = {
          request with
          status = #rejected;
          reviewedAt = Time.now();
        };
        depositRequests.add(id, updated);
      };
    };
  };

  //----------------- Withdrawal System -----------------//

  public shared ({ caller }) func submitWithdrawalRequest(
    username : Text,
    amount : Nat,
    currency : Text,
    walletAddress : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit withdrawal requests");
    };

    switch (userAccounts.get(caller)) {
      case (null) { Runtime.trap("User account not found") };
      case (?account) {
        if (account.username != username) {
          Runtime.trap("Username does not match caller's account");
        };
        if (amount < 10000) {
          Runtime.trap("Invalid amount, checkout withdrawal requirements");
        };
        if (amount > account.balance) {
          Runtime.trap("Insufficient balance for withdrawal");
        };

        let newBalance = if (account.balance >= amount) { account.balance - amount } else { 0 };
        userAccounts.add(caller, { account with balance = newBalance });

        let request : WithdrawalRequest = {
          id = nextWithdrawalId;
          userId = caller;
          username;
          amount;
          currency;
          walletAddress;
          status = #pending;
          createdAt = Time.now();
          reviewedAt = 0;
        };
        withdrawalRequests.add(nextWithdrawalId, request);
        nextWithdrawalId += 1;
      };
    };
  };

  public query ({ caller }) func getUserWithdrawals() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view withdrawal history");
    };

    switch (userAccounts.get(caller)) {
      case (null) { Runtime.trap("User account not found") };
      case (?_) {
        withdrawalRequests.values().toArray().filter(
          func(r) { r.userId == caller }
        );
      };
    };
  };

  public query ({ caller }) func getPendingWithdrawals() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get pending withdrawals");
    };
    withdrawalRequests.values().toArray().filter(
      func(r) { r.status == #pending }
    );
  };

  public query ({ caller }) func getAllWithdrawals() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all withdrawals");
    };
    withdrawalRequests.values().toArray();
  };

  public shared ({ caller }) func approveWithdrawal(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve withdrawals");
    };

    switch (withdrawalRequests.get(id)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?request) {
        if (request.status != #pending) {
          Runtime.trap("Withdrawal request already processed");
        };
        let updated : WithdrawalRequest = {
          request with
          status = #approved;
          reviewedAt = Time.now();
        };
        withdrawalRequests.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func rejectWithdrawal(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject withdrawals");
    };

    switch (withdrawalRequests.get(id)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?request) {
        if (request.status != #pending) {
          Runtime.trap("Withdrawal request already processed");
        };
        let updated : WithdrawalRequest = {
          request with
          status = #rejected;
          reviewedAt = Time.now();
        };
        withdrawalRequests.add(id, updated);

        switch (userAccounts.get(request.userId)) {
          case (null) { Runtime.trap("User account not found") };
          case (?account) {
            userAccounts.add(request.userId, { account with balance = account.balance + request.amount });
          };
        };
      };
    };
  };

  //----------------- Earn System -----------------//

  public shared ({ caller }) func claimEarnForVideo(
    username : Text,
    videoId : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim earnings");
    };

    switch (userAccounts.get(caller)) {
      case (null) { Runtime.trap("User account not found") };
      case (?account) {
        if (account.username != username) {
          Runtime.trap("Username does not match caller's account");
        };

        switch (vlogPosts.get(videoId)) {
          case (null) { Runtime.trap("Vlog post not found") };
          case (?post) {
            if (post.category != #vlog) {
              Runtime.trap("Only vlog videos can be claimed");
            };
            let alreadyClaimed = earnRecords.values().toArray().any(
              func(r) {
                r.userId == caller and r.taskType == #watchVideo and r.contentId == videoId.toText()
              }
            );
            if (alreadyClaimed) {
              Runtime.trap("Already claimed this video");
            };
            let earnRecord : EarnRecord = {
              id = nextEarnId;
              userId = caller;
              username;
              taskType = #watchVideo;
              contentId = videoId.toText();
              amount = 100;
              status = #pending;
              createdAt = Time.now();
            };
            earnRecords.add(nextEarnId, earnRecord);
            nextEarnId += 1;
          };
        };
      };
    };
  };

  public shared ({ caller }) func claimEarnForArticle(
    username : Text,
    articleTitle : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim earnings");
    };

    switch (userAccounts.get(caller)) {
      case (null) { Runtime.trap("User account not found") };
      case (?account) {
        if (account.username != username) {
          Runtime.trap("Username does not match caller's account");
        };
        let alreadyClaimed = earnRecords.values().toArray().any(
          func(r) {
            r.userId == caller and r.taskType == #writeArticle and r.contentId == articleTitle
          }
        );
        if (alreadyClaimed) {
          Runtime.trap("Already claimed this article");
        };
        let earnRecord : EarnRecord = {
          id = nextEarnId;
          userId = caller;
          username;
          taskType = #writeArticle;
          contentId = articleTitle;
          amount = 100;
          status = #pending;
          createdAt = Time.now();
        };
        earnRecords.add(nextEarnId, earnRecord);
        nextEarnId += 1;
      };
    };
  };

  public query ({ caller }) func getUserEarnRecords() : async [EarnRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view earn history");
    };
    switch (userAccounts.get(caller)) {
      case (null) { Runtime.trap("User account not found") };
      case (?_) {
        earnRecords.values().toArray().filter(
          func(r) { r.userId == caller }
        );
      };
    };
  };

  public query ({ caller }) func getPendingEarnRecords() : async [EarnRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get pending earn records");
    };
    earnRecords.values().toArray().filter(
      func(r) { r.status == #pending }
    );
  };

  public shared ({ caller }) func approveEarnRecord(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve earn records");
    };

    switch (earnRecords.get(id)) {
      case (null) { Runtime.trap("Earn record not found") };
      case (?record) {
        if (record.status != #pending) {
          Runtime.trap("Earn record already processed");
        };
        earnRecords.add(id, { record with status = #approved });
        switch (userAccounts.get(record.userId)) {
          case (null) { Runtime.trap("User account not found") };
          case (?account) {
            userAccounts.add(record.userId, {
              account with
              balance = account.balance + record.amount;
              totalEarned = account.totalEarned + record.amount;
            });
          };
        };
      };
    };
  };

  public shared ({ caller }) func rejectEarnRecord(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject earn records");
    };
    switch (earnRecords.get(id)) {
      case (null) { Runtime.trap("Earn record not found") };
      case (?record) {
        if (record.status != #pending) {
          Runtime.trap("Earn record already processed");
        };
        earnRecords.add(id, { record with status = #rejected });
      };
    };
  };

  //----------------- Admin Dashboard Stats -----------------//

  public query ({ caller }) func getAdminStats() : async AdminDashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get stats");
    };

    let totalUsers = userRegistrationData.size();
    let totalPendingDeposits = depositRequests.values().toArray().filter(
      func(r) { r.status == #pending }
    ).size();
    let totalPendingWithdrawals = withdrawalRequests.values().toArray().filter(
      func(r) { r.status == #pending }
    ).size();
    let totalPendingEarnRecords = earnRecords.values().toArray().filter(
      func(r) { r.status == #pending }
    ).size();
    var totalPlatformBalance = 0;
    userAccounts.values().forEach(
      func(account) { totalPlatformBalance += account.balance }
    );
    {
      totalUsers;
      totalPendingDeposits;
      totalPendingWithdrawals;
      totalPendingEarnRecords;
      totalPlatformBalance;
    };
  };

  //----------------- HTTP Outcalls -----------------//

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func fetchCryptoPrices() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch crypto prices");
    };
    await OutCall.httpGetRequest(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1",
      [],
      transform,
    );
  };

  public shared ({ caller }) func fetchWorldNews() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch world news");
    };
    await OutCall.httpGetRequest(
      "https://gnews.io/api/v4/top-headlines?category=general&lang=en&max=20&apikey=demo",
      [],
      transform,
    );
  };

  // ============================================================
  // PUBLIC (ANONYMOUS-FRIENDLY) FUNCTIONS FOR CROSS-DEVICE SYNC
  // ============================================================

  public shared func registerUserPublic(
    username : Text,
    email : Text,
    fullName : Text,
    joinDate : Int,
    referralCode : Text,
    referredBy : ?Text,
  ) : async () {
    let takenInAnon = usernameUsers.values().toArray().any(
      func(d : UserRegistrationData) : Bool { d.username == username }
    );
    if (takenInAnon) { Runtime.trap("Username already taken") };
    let takenInPrincipal = userRegistrationData.values().toArray().any(
      func(d : UserRegistrationData) : Bool { d.username == username }
    );
    if (takenInPrincipal) { Runtime.trap("Username already taken") };
    let rd : UserRegistrationData = {
      principalId = "anon"; username; email; fullName; joinDate; referralCode; referredBy;
    };
    usernameUsers.add(username, rd);
    usernameBalances.add(username, 0);
    switch (referredBy) {
      case (null) {};
      case (?refCode) {
        let referrerEntry = usernameUsers.values().toArray().find(
          func(d : UserRegistrationData) : Bool { d.referralCode == refCode }
        );
        switch (referrerEntry) {
          case (null) {};
          case (?ref) {
            let cur = switch (usernameBalances.get(ref.username)) { case (null) { 0 }; case (?b) { b } };
            usernameBalances.add(ref.username, cur + 1000);
          };
        };
      };
    };
  };

  public query func getAllUsersPublic() : async [UserInfo] {
    usernameUsers.values().toArray().map(func(rd : UserRegistrationData) : UserInfo {
      let bal = switch (usernameBalances.get(rd.username)) { case (null) { 0 }; case (?b) { b } };
      { principalId = rd.principalId; username = rd.username; email = rd.email;
        fullName = rd.fullName; joinDate = rd.joinDate; referralCode = rd.referralCode;
        referredBy = rd.referredBy; balance = bal; totalEarned = 0; totalDeposited = 0; }
    })
  };

  public shared func submitDepositPublic(username : Text, currency : Text, amount : Text, txHash : Text) : async () {
    let request : DepositRequest = {
      id = nextDepositId; userId = Principal.fromText("2vxsx-fae");
      username; currency; amount; txHash; status = #pending;
      createdAt = Time.now(); reviewedAt = 0;
    };
    depositRequests.add(nextDepositId, request);
    nextDepositId += 1;
  };

  public shared func submitWithdrawalPublic(username : Text, amount : Nat, currency : Text, walletAddress : Text) : async () {
    let request : WithdrawalRequest = {
      id = nextWithdrawalId; userId = Principal.fromText("2vxsx-fae");
      username; amount; currency; walletAddress; status = #pending;
      createdAt = Time.now(); reviewedAt = 0;
    };
    withdrawalRequests.add(nextWithdrawalId, request);
    nextWithdrawalId += 1;
  };

  public query func getAllDepositsPublic() : async [DepositRequest] {
    depositRequests.values().toArray()
  };

  public query func getAllWithdrawalsPublic() : async [WithdrawalRequest] {
    withdrawalRequests.values().toArray()
  };

  public shared func approveDepositAdmin(id : Nat, adminPw : Text) : async () {
    if (adminPw != "Sandeep@321") { Runtime.trap("Invalid admin credentials") };
    switch (depositRequests.get(id)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?request) {
        if (not (request.status == #pending)) { Runtime.trap("Already processed") };
        depositRequests.add(id, { request with status = #approved; reviewedAt = Time.now() });
        let amountNat = switch (Nat.fromText(request.amount)) { case (null) { 0 }; case (?n) { n } };
        let cur = switch (usernameBalances.get(request.username)) { case (null) { 0 }; case (?b) { b } };
        usernameBalances.add(request.username, cur + amountNat);
        switch (userAccounts.get(request.userId)) {
          case (null) {};
          case (?account) {
            userAccounts.add(request.userId, { account with balance = account.balance + amountNat; totalDeposited = account.totalDeposited + amountNat });
          };
        };
      };
    };
  };

  public shared func rejectDepositAdmin(id : Nat, adminPw : Text) : async () {
    if (adminPw != "Sandeep@321") { Runtime.trap("Invalid admin credentials") };
    switch (depositRequests.get(id)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?request) {
        depositRequests.add(id, { request with status = #rejected; reviewedAt = Time.now() });
      };
    };
  };

  public shared func approveWithdrawalAdmin(id : Nat, adminPw : Text) : async () {
    if (adminPw != "Sandeep@321") { Runtime.trap("Invalid admin credentials") };
    switch (withdrawalRequests.get(id)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?request) {
        if (not (request.status == #pending)) { Runtime.trap("Already processed") };
        withdrawalRequests.add(id, { request with status = #approved; reviewedAt = Time.now() });
      };
    };
  };

  public shared func rejectWithdrawalAdmin(id : Nat, adminPw : Text) : async () {
    if (adminPw != "Sandeep@321") { Runtime.trap("Invalid admin credentials") };
    switch (withdrawalRequests.get(id)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?request) {
        withdrawalRequests.add(id, { request with status = #rejected; reviewedAt = Time.now() });
        let cur = switch (usernameBalances.get(request.username)) { case (null) { 0 }; case (?b) { b } };
        usernameBalances.add(request.username, cur + request.amount);
      };
    };
  };

  public query func getUserBalancePublic(username : Text) : async Nat {
    switch (usernameBalances.get(username)) { case (null) { 0 }; case (?b) { b } };
  };


};