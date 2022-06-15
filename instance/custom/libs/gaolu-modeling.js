(function() {
    function getSubPath(json, tall) {
        var outRS = json.outsideRadius.split(';');
        var inRS = json.insideRadius.split(';');
        var k = 0.1;
        var h = parseInt(json.height) * k;

        var maxR = -Infinity;
        for (var i = 0; i < 2; i++) {
            var r = outRS[i];
            if (!r)
                outRS[i] = outRS[0];
            else
                outRS[i] = parseInt(r) * 0.5 * k;
            maxR = Math.max(maxR, outRS[i]);

            r = inRS[i];
            if (!r)
                inRS[i] = inRS[0];
            else
                inRS[i] = parseInt(r) * 0.5 * k;
            maxR = Math.max(maxR, inRS[i]);
        }

        return {
            outsidePath: [
                outRS[1], tall,
                outRS[0], tall + h
            ],
            insidePath: [
                inRS[1], tall,
                inRS[0], tall + h
            ],
            r: maxR,
            h: h
        };
    }
	ht.Default.setModelTypeHandler('gaolu', function(json, callback) {
        var outsidePath = [],
            insidePath = [],
            r = -Infinity, tall = 0;
        for (var i = json.params.length - 1; i >= 0; i--) {
            var res = getSubPath(json.params[i], tall);
            r = Math.max(r, res.r);
            tall += res.h;
            outsidePath.push.apply(outsidePath, res.outsidePath);
            insidePath.push.apply(insidePath, res.insidePath);
        }
        r *= 2;

        var path = [];
        for (var i = outsidePath.length - 1; i >= 0; i -= 2) {
            path.push(outsidePath[i - 1] / r);
            path.push(outsidePath[i] / tall - 0.5);
        }

        var len = insidePath.length;
        for (var i = 0; i < len; i += 2) {
            path.push(insidePath[i] / r);
            path.push(insidePath[i + 1] / tall - 0.5);
        }

        var segments = [];
        for (var i = path.length / 2 - 1; i >= 0; i--)
            segments.push(2);
        segments[0] = 1;
        segments.push(5);

        var shape3d = [ht.Default.createRingModel(path, segments)];
        shape3d.rawS3 = [r, tall, r];
        callback(shape3d);
	});

}(window));

