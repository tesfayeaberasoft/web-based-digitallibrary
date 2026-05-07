# 🎨 Librarian Notifications - Visual Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🔔 Notifications Center                    [🔄 Refresh]        │
│  Real-time library activity and alerts                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 🔴 RED       │  │ 🟠 ORANGE    │  │ 🟢 TEAL      │         │
│  │              │  │              │  │              │         │
│  │      8       │  │     15       │  │     22       │         │
│  │ High Priority│  │Medium Priority│  │Low Priority  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  [All (45)] [High Priority 🔴8] [Medium 🟠15] [Low (22)]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔴 Overdue Book Alert              [High Priority]      │   │
│  │ John Doe has 'The Great Gatsby' overdue by 5 days      │   │
│  │ 👤 John Doe • john@email.com                           │   │
│  │ 🕒 2 hours ago                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🟠 Out of Stock                    [High Priority]      │   │
│  │ 'To Kill a Mockingbird' is out of stock (0/5 available)│   │
│  │ 🕒 1 hour ago                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🟠 Low Inventory Alert             [Medium]             │   │
│  │ '1984' has only 2/10 copies available                  │   │
│  │ 🕒 30 minutes ago                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🟢 New Book Issued                 [Low]                │   │
│  │ Jane Smith borrowed 'Harry Potter'                      │   │
│  │ 👤 Jane Smith • jane@email.com                         │   │
│  │ 🕒 Just now                                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Notification Types with Icons

### 🔴 High Priority (Red Background)

#### 1. Overdue Book Alert
```
┌─────────────────────────────────────────────┐
│ ⚠️  Overdue Book Alert    [High Priority]  │
│                                             │
│ John Doe has 'The Great Gatsby'            │
│ overdue by 5 days                          │
│                                             │
│ 👤 John Doe • john@email.com              │
│ 🕒 2 hours ago                             │
└─────────────────────────────────────────────┘
```

#### 2. Out of Stock
```
┌─────────────────────────────────────────────┐
│ 📦 Out of Stock          [High Priority]   │
│                                             │
│ 'To Kill a Mockingbird' is out of stock    │
│ (0/5 available)                            │
│                                             │
│ 🕒 1 hour ago                              │
└─────────────────────────────────────────────┘
```

---

### 🟠 Medium Priority (Orange Background)

#### 3. Low Inventory Alert
```
┌─────────────────────────────────────────────┐
│ 📦 Low Inventory Alert      [Medium]       │
│                                             │
│ '1984' has only 2/10 copies available      │
│                                             │
│ 🕒 30 minutes ago                          │
└─────────────────────────────────────────────┘
```

#### 4. Unpaid Fine
```
┌─────────────────────────────────────────────┐
│ 💰 Unpaid Fine              [Medium]       │
│                                             │
│ John Doe has an unpaid overdue fine        │
│ of $15.00                                  │
│                                             │
│ 👤 John Doe • john@email.com              │
│ 🕒 1 day ago                               │
└─────────────────────────────────────────────┘
```

#### 5. Pending Reservation
```
┌─────────────────────────────────────────────┐
│ ⏰ Pending Reservation      [Medium]       │
│                                             │
│ Jane Smith reserved 'Harry Potter' -       │
│ Book is now available!                     │
│                                             │
│ 👤 Jane Smith • jane@email.com            │
│ 🕒 3 hours ago                             │
└─────────────────────────────────────────────┘
```

---

### 🟢 Low Priority (Teal/Blue/Green Background)

#### 6. New Book Issued
```
┌─────────────────────────────────────────────┐
│ ✅ New Book Issued             [Low]       │
│                                             │
│ Jane Smith borrowed 'Harry Potter and      │
│ the Philosopher's Stone'                   │
│                                             │
│ 👤 Jane Smith • jane@email.com            │
│ 🕒 Just now                                │
└─────────────────────────────────────────────┘
```

#### 7. Book Returned
```
┌─────────────────────────────────────────────┐
│ 🔄 Book Returned               [Low]       │
│                                             │
│ John Doe returned 'The Great Gatsby'       │
│                                             │
│ 👤 John Doe • john@email.com              │
│ 🕒 5 minutes ago                           │
└─────────────────────────────────────────────┘
```

#### 8. New User Registration
```
┌─────────────────────────────────────────────┐
│ 👤 New User Registration       [Low]       │
│                                             │
│ Alice Johnson (alice@email.com)            │
│ registered                                 │
│                                             │
│ 👤 Alice Johnson • alice@email.com        │
│ 🕒 2 days ago                              │
└─────────────────────────────────────────────┘
```

---

## Color Scheme

### Priority Cards (Top Section)
```
High Priority:     #ff6b6b → #ee5a6f (Red gradient)
Medium Priority:   #ff9800 → #f57c00 (Orange gradient)
Low Priority:      #4a9b8e → #3d8276 (Teal gradient)
```

### Notification Avatars
```
Overdue:           #ff6b6b (Red)
Low Inventory:     #ff9800 (Orange)
New Loan:          #4a9b8e (Teal)
Book Returned:     #2196f3 (Blue)
Reservation:       #a78bfa (Purple)
Unpaid Fine:       #f59e0b (Amber)
New User:          #10b981 (Green)
```

### Priority Chips
```
High:    Red text on light red background
Medium:  Orange text on light orange background
Low:     Teal text on light teal background
```

---

## Sidebar Menu

```
┌─────────────────────────┐
│ Librarian Panel         │
├─────────────────────────┤
│ 📊 Overview             │
│ 🔔 Notifications  [!]   │  ← NEW! Red badge
│ 📋 Requests             │
│ 📦 Inventory            │
│ 👥 Members              │
│ 📈 Reports              │
└─────────────────────────┘
```

---

## Tab Navigation

```
┌────────────────────────────────────────────────────────┐
│ [All (45)] [High Priority 🔴8] [Medium 🟠15] [Low (22)]│
└────────────────────────────────────────────────────────┘
     ↑           ↑                ↑            ↑
   Active    With badge       With badge    Simple
```

---

## Responsive Behavior

### Desktop (>960px)
```
┌─────────────┬─────────────┬─────────────┐
│ High Card   │ Medium Card │  Low Card   │
└─────────────┴─────────────┴─────────────┘
```

### Tablet (600-960px)
```
┌─────────────┬─────────────┐
│ High Card   │ Medium Card │
└─────────────┴─────────────┘
┌─────────────┐
│  Low Card   │
└─────────────┘
```

### Mobile (<600px)
```
┌─────────────┐
│ High Card   │
└─────────────┘
┌─────────────┐
│ Medium Card │
└─────────────┘
┌─────────────┐
│  Low Card   │
└─────────────┘
```

---

## Animation Effects

### Page Load
- **Fade In**: Entire page (600ms)
- **Grow**: Priority cards (600ms, 800ms, 1000ms staggered)
- **Fade**: Each notification (300ms + 50ms per item)

### Hover Effects
- **Cards**: Slight elevation and background color change
- **Buttons**: Color darkening
- **Smooth transitions**: All 0.3s ease

### Auto-Refresh
- **Loading Indicator**: Circular progress in center
- **Smooth Transition**: Fade out old, fade in new

---

## Interactive Elements

### Refresh Button
```
┌──────────────┐
│ 🔄 Refresh   │  ← Outlined button, teal color
└──────────────┘
   Disabled during loading
```

### Tab Badges
```
High Priority 🔴8   ← Red badge with count
Medium 🟠15         ← Orange badge with count
```

### Notification Cards
```
Hover: Background changes to light gray
Click: (Future) Navigate to related page
```

---

## Empty State

```
┌─────────────────────────────────────────┐
│                                         │
│           🔔 (Large icon)               │
│                                         │
│        No notifications                 │
│                                         │
│   All caught up! No notifications       │
│   at this time.                         │
│                                         │
└─────────────────────────────────────────┘
```

---

## Footer Info

```
ℹ️ Total: 45 notifications • Auto-refreshes every 30 seconds
```

---

**This is what you'll see when you access `/librarian/notifications`!** 🎉
