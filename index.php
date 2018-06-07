<?php
	include dirname(__FILE__) . "/palettes.php";

	function getContrastYIQ($hexcolor){
		$hexcolor = str_replace("#", "", $hexcolor);
		$r = hexdec(substr($hexcolor,0,2));
		$g = hexdec(substr($hexcolor,2,2));
		$b = hexdec(substr($hexcolor,4,2));
		$yiq = (($r*299)+($g*587)+($b*114))/1000;
		return ($yiq >= 128) ? 'black' : 'white';
	}

	$chosenPalette = $palettes[random_int(0, count($palettes)-1)];
	//$chosenPalette = $palettes[count($palettes)-1];
	$chosenColors = random_int(0, 1) ? [$chosenPalette[0], $chosenPalette[1]] : [$chosenPalette[1], $chosenPalette[0]];
	$strokeColor = getContrastYIQ($chosenColors[0]);
?>

<html>

<head>
	<style type="text/css">
		body {
			font-family: sans-serif;
			background-color: #<?php echo $chosenColors[0]; ?>;
		}

		#phrase {
			width: 100vw;
			text-align: center;
			font-size: calc(100% + 3.5vw);
			font-weight: 700;

			position: absolute;
			left: 50%;
			top: 50%;
			-webkit-transform: translate(-50%, -50%);
			transform: translate(-50%, -50%);

			color: #<?php echo $chosenColors[1]; ?>;
			text-stroke: <?php echo $strokeColor; ?>;
			-webkit-text-stroke: <?php echo $strokeColor; ?>;
			-moz-text-stroke: <?php echo $strokeColor; ?>;
			text-stroke-width: .12vw;
			-moz-text-stroke-width: .12vw;
			-webkit-text-stroke-width: .12vw;
			paint-order: stroke fill;
		}
	</style>
</head>

<body>
	<div id="phrase">
		<?php
			echo exec("node main.js");
		?>
	</div>
</body>

</html>