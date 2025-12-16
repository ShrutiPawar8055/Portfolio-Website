<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode([
    'success' => false,
    'message' => 'Invalid request method.'
  ]);
  exit;
}

// CONFIGURATION
$receiving_email_address = 'shrutikeshavpawar@gmail.com';

// Sanitize input
$name    = trim(htmlspecialchars($_POST['name'] ?? ''));
$email   = trim(filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL));
$subject = trim(htmlspecialchars($_POST['subject'] ?? ''));
$message = trim(htmlspecialchars($_POST['message'] ?? ''));

// Basic validation
if (!$name || !$email || !$subject || !$message) {
  echo json_encode([
    'success' => false,
    'message' => 'All fields are required.'
  ]);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode([
    'success' => false,
    'message' => 'Invalid email address.'
  ]);
  exit;
}

// Email headers
$headers  = "From: $name <$email>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Email body
$email_body = "New Contact Message\n\n";
$email_body .= "Name: $name\n";
$email_body .= "Email: $email\n";
$email_body .= "Subject: $subject\n\n";
$email_body .= "Message:\n$message\n";

// Send mail
$mail_sent = mail(
  $receiving_email_address,
  "[Portfolio Contact] $subject",
  $email_body,
  $headers
);

if ($mail_sent) {
  echo json_encode([
    'success' => true
  ]);
} else {
  echo json_encode([
    'success' => false,
    'message' => 'Failed to send email. Server mail not configured.'
  ]);
}
