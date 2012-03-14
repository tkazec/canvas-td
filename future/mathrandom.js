Math.rand = (function(){
	var x = Math.random() * 100000, y = 10240, z = 12345, w = 67890, d = Math.pow(2, 32);
	
	return function(max){
		var t = x ^ (x << 15);
		x = y; y = z; z = w;
		w = ((w ^ (w >>> 21)) ^ (t ^ (t >>> 4))) >>> 0;
		return Math.floor((w / d) * (max + 1));
	};
})();