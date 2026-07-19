<!DOCTYPE html>
<html lang="en">

<head>
  <!-- Encoding -->
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">

  <!-- Mobile Compatability -->
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Basics -->
  <title>Triple Triad</title>
  <meta name="author" content="Simon Henshall">
  <meta name="description" content="A fan-made implementation of popular Square Enix card game Triple Triad">
  <meta name="copyright" content="Game concept © Square Enix. Web version © Simon Henshall. All rights resevered.">

  <!-- Favicon -->
  <link rel="shortcut icon" href="/favicon.ico">

  <!-- Bootstrap -->
  <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">

  <!-- Game Rules Panel Styles -->
  <style>
    html,
    body {
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    #game {
      display: flex;
      align-items: stretch;
      gap: 20px;
      justify-content: center;
      box-sizing: border-box;
      height: 100vh;
      padding: 20px;
    }

    #rules-panel-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 320px;
      min-width: 260px;
    }

    #rules-panel,
    #rules-details {
      background: #1a1a2e;
      border: 2px solid #c8a84e;
      border-radius: 8px;
      color: #e0d6c8;
      font-family: 'Lato', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      padding: 16px 20px;
    }

    #rules-panel {
      flex-shrink: 0;
    }

    #rules-details {
      flex: 1;
      overflow-y: auto;
    }

    #rules-panel h3,
    #rules-details h3 {
      color: #c8a84e;
      font-family: 'Montserrat', Arial, sans-serif;
      font-size: 16px;
      margin: 12px 0 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    #rules-panel h3:first-child,
    #rules-details h3:first-child {
      margin-top: 0;
    }

    #rules-panel ul {
      margin: 0 0 8px;
      padding-left: 18px;
    }

    #rules-panel li {
      margin-bottom: 4px;
    }

    #rules-details dl {
      margin: 0;
    }

    #rules-details dt {
      color: #c8a84e;
      font-family: 'Montserrat', Arial, sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-top: 8px;
      text-transform: uppercase;
    }

    #rules-details dt:first-of-type {
      margin-top: 0;
    }

    #rules-details dd {
      margin: 2px 0 0 0;
      font-size: 13px;
      line-height: 1.5;
    }

    .controls-table {
      width: 100%;
      border-collapse: collapse;
    }

    .controls-table td {
      padding: 4px 0;
      vertical-align: top;
    }

    .controls-table td:first-child {
      white-space: nowrap;
      padding-right: 12px;
    }

    .controls-table kbd {
      background: #2a2a3e;
      border: 1px solid #555;
      border-radius: 3px;
      color: #e0d6c8;
      display: inline-block;
      font-family: 'Montserrat', Arial, sans-serif;
      font-size: 12px;
      line-height: 1;
      margin: 0 1px;
      padding: 3px 6px;
    }
  </style>

  <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
  <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
  <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

  <!-- Google Fonts -->
  <link href='http://fonts.googleapis.com/css?family=Lato:300,400,300italic,400italic' rel='stylesheet' type='text/css'>
  <link href='http://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css'>

  <!-- jQuery -->
  <script type="text/javascript" src="http://code.jquery.com/jquery-latest.min.js"></script>

  <!-- CreateJS -->
  <script type="text/javascript" src="https://code.createjs.com/easeljs-0.8.2.min.js"></script>
  <script type="text/javascript" src="https://code.createjs.com/tweenjs-0.6.2.min.js"></script>
  <script type="text/javascript" src="https://code.createjs.com/soundjs-0.6.2.min.js"></script>
  <script type="text/javascript" src="https://code.createjs.com/preloadjs-0.6.2.min.js"></script>

  <!-- Bootstrap -->
  <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
</head>

<body>