import random
class Queue:
	def __init__(self):
		self.items = []

	def enqueue(self, item):
		self.items.append(item) #adds to the back

	def dequeue(self):
		return self.items.pop(0) #pops the first item

	def isEmpty(self):
		return self.items == []

def radix():
	#create list
	lyst = []
	for a in range(10):
		lyst.append(random.randint(1000, 9999))

	mainBin = []
	for i in range(10):
		mainBin.append(Queue())
	
	L = len(str(lyst[0]))
	for i in range(L-1, -1, -1):
		for item in lyst:
			temp = int(str(item)[i])
			mainBin[temp].enqueue(item)

		lyst = []
		for b in range(len(mainBin)):
			while not mainBin[b].isEmpty():
				lyst.append(mainBin[b].dequeue())
		
	print(lyst)

radix()
